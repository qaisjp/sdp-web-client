import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import QrReader from "react-qr-reader";

import Card from "../../components/Card/Card.jsx";
import LoggingTable from "../../components/Logging/Logging";
import Modal from "../../components/Modal/Modal.jsx";
import Header from "../../components/Header/Header";

import getPlantName from "../../components/Logging/logging_get_plant_name";
import getRobotName from "../../components/Logging/logging_get_robot_name";

import green_circle from "../../assets/img/green_circle.png";
import red_circle from "../../assets/img/red_circle.png";

import removeRobot from "../../actions/remove_robot";
import selectRobot from "../../actions/select_robot";
import addPlant from "../../actions/add_plant";
import addRobot from "../../actions/add_robot";
import renameRobot from "../../actions/rename_robot";
import httpFetchPlants from "../../http/fetch_plants";
import httpAddRobot from "../../http/add_robot";
import httpRenameRobot from "../../http/rename_robot";
import httpRemoveRobot from "../../http/remove_robot";

import PlantsCard from "./PlantsCard";
import httpFetchLogs from "../../http/fetch_logs";
import {api, NEW_LOG_ENTRY, UPDATE_ROBOT_STATE} from "../../API";

const Home = props => {
    const {
        loginToken,
        reduxRobots,
        reduxPlants,
        fetchRobots,
    } = props;

    const [logs, setLogs] = useState([]);
    const [selectedRobot, setSelectedRobot] = useState({});
    const [newRobotSerialKey, setNewRobotSerialKey] = useState("");
    const [newRobotTitle, setNewRobotTitle] = useState("");
    const [renameRobotTitle, setRenameRobotTitle] = useState("");
    const [addRobotModalOpen, addRobotModalVisible] = useState(false);
    const [renameRobotModalOpen, renameRobotModalVisible] = useState(false);
    const [removeRobotModalOpen, removeRobotModalVisible] = useState(false);
    const [alertVisible, showAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState(false);
    const [qrDelay] = useState(0);

    const newLogEntryCallback = entry => {
        const updatedLogs = [entry, ...logs].slice(0, 5);
        setLogs(updatedLogs);
    };
    api.subscribe(NEW_LOG_ENTRY, newLogEntryCallback);

    const newRobotStateCallback = state => {
        const {reduxRemoveRobot, reduxAddRobot} = props;

        const id = state.id;
        const filteredList = reduxRobots.filter(robot => robot.id === id);
        const robot = filteredList.length === 1 ? filteredList.pop() : null;


        if(robot) {
            reduxRemoveRobot(robot);

            if("seen_at" in state) {
                robot.seen_at = state["seen_at"];
            }

            if("distress" in state) {
                robot.distress = state["distress"];
            }

            if("water_level" in state) {
                robot.water_level = state["water_level"];
            }

            if("battery_level" in state) {
                robot.battery_level = state["battery_level"];
            }

            reduxAddRobot(robot);
        }
    };

    useEffect(() => {
        fetchPlants();
        fetchLogs();

        api.subscribe(NEW_LOG_ENTRY, newLogEntryCallback);
        api.subscribe(UPDATE_ROBOT_STATE, newRobotStateCallback);

        return () => {
            api.unsubscribe(NEW_LOG_ENTRY, newLogEntryCallback);
            api.unsubscribe(UPDATE_ROBOT_STATE, newRobotStateCallback);
        }
    }, []);

    const fetchLogs = async () => {
        const {loginToken} = props;
        const fetchLogsResult = await httpFetchLogs(loginToken, "limit=5");

        if (!(fetchLogsResult instanceof Error)) {
            const {entries} = fetchLogsResult;
            setLogs(entries);
        }
    };

    const fetchPlants = async () => {
        const {reduxAddPlant} = props;
        const fetchPlantsResult = await httpFetchPlants(loginToken);

        if (!(fetchPlantsResult instanceof Error)) {
            const {plants} = fetchPlantsResult;
            const reduxPlantIds = reduxPlants.map(plant => plant.id);
            plants
                .filter(plant => reduxPlantIds.indexOf(plant.id) < 0)
                .forEach(plant => {
                    reduxAddPlant(plant);
                });
        }
    };

    const onRemoveRobot = async () => {
        const {loginToken, reduxRemoveRobot} = props;

        const response = await httpRemoveRobot(loginToken, selectedRobot.id);

        if (response.status === 200) {
            reduxRemoveRobot(selectedRobot);
        }

        removeRobotModalVisible(false);
    };

    const onAddRobot = async () => {
        if (newRobotSerialKey === "" || newRobotTitle === "") {
            showAlert(true);
            setAlertMessage(
                "Please make sure you've added a serial key and a title!"
            );
            return;
        }
        const {reduxAddRobot} = props;
        const response = await httpAddRobot(
            loginToken,
            newRobotSerialKey,
            newRobotTitle
        );

        if (response.status === 200) {
            const fetchRobotsResult = await fetchRobots(loginToken);

            if (!fetchRobotsResult instanceof Error) {
                const {robots} = fetchRobotsResult;
                const reduxRobotIds = reduxRobots.map(robot => robot.id);
                robots
                    .filter(robot => reduxRobotIds.indexOf(robot.id) < 0)
                    .forEach(robot => {
                        reduxAddRobot(robot);
                    });
            }
        }
        addRobotModalVisible(false);
        showAlert(false);
        setAlertMessage("");
    };

    const onRenameRobot = async () => {
        if (renameRobotTitle === "") {
            showAlert(true);
            setAlertMessage("Please make sure you've entered a new name!");
            return;
        }
        const {reduxRenameRobot} = props;

        const response = await httpRenameRobot(
            loginToken,
            selectedRobot.id,
            renameRobotTitle
        );

        if (response.status === 200) {
            reduxRenameRobot(selectedRobot, renameRobotTitle);
        }
        renameRobotModalVisible(false);
        showAlert(false);
        setAlertMessage("");
    };
    const createRenameRobotModalContent = () => {
        return (
            <div>
                <div
                    style={!alertVisible ? {display: "none"} : {display: "block"}}
                    className="alert alert-danger"
                    role="alert"
                >
                    {alertMessage}
                </div>
                <p>Please give the robot a new name</p>
                <div className="form-group">
                    <label htmlFor="inputName">New Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="inputName"
                        placeholder="Name"
                        onChange={event => setRenameRobotTitle(event.target.value)}
                    />
                </div>
            </div>
        );
    };
    const createRenameRobotModalFooter = () => {
        return (
            <React.Fragment>
                <button
                    onClick={() => {
                        showAlert(false);
                        setAlertMessage("");
                        renameRobotModalVisible(false);
                    }}
                    className="btn btn-secondary"
                >
                    Close
                </button>
                <button onClick={onRenameRobot} className="btn btn-primary">
                    Rename
                </button>
            </React.Fragment>
        );
    };
    const createRemoveRobotModalContent = () => {
        return <p>Are you sure you want to remove this robot?</p>;
    };
    const createRemoveRobotModalFooter = () => {
        return (
            <React.Fragment>
                <button
                    onClick={() => {
                        removeRobotModalVisible(false);
                    }}
                    className="btn btn-secondary"
                >
                    Close
                </button>
                <button onClick={onRemoveRobot} className="btn btn-danger">
                    Remove
                </button>
            </React.Fragment>
        );
    };

    const createAddRobotModalContent = () => {
        return (
            <React.Fragment>
                <div
                    style={!alertVisible ? {display: "none"} : {display: "block"}}
                    className="alert alert-danger"
                    role="alert"
                >
                    {alertMessage}
                </div>
                <QrReader
                    delay={qrDelay}
                    onError={qrHandleError}
                    onScan={qrHandleScan}
                    style={{width: "100%"}}
                />
                <div>
                    <div className="form-group">
                        <label htmlFor="inputSerialKey">Serial Key</label>
                        <input
                            type="text"
                            className="form-control"
                            id="inputSerialKey"
                            placeholder="Key"
                            onChange={event => setNewRobotSerialKey(event.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="inputTitle">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            id="inputTitle"
                            placeholder="Title"
                            onChange={event => setNewRobotTitle(event.target.value)}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    };

    const createAddRobotModalFooter = () => {
        return (
            <React.Fragment>
                <button
                    onClick={() => {
                        showAlert(false);
                        setAlertMessage("");
                        addRobotModalVisible(false);
                    }}
                    className="btn btn-secondary"
                >
                    Close
                </button>
                <button onClick={onAddRobot} className="btn btn-primary">
                    Add
                </button>
            </React.Fragment>
        );
    };

    // When a new plant is added via the interface, refetch all plants
    const onPlantAdded = async () => {
        fetchPlants();
    };

    const qrHandleScan = data => {
        const prefix = "growbot:";
        if (data && data.startsWith(prefix))
            setNewRobotSerialKey(data.slice(prefix.length));
    };
    const qrHandleError = error => {
        alert(error);
    };

    return <>
        <Header location={props.location} />
        <div className="content">
            <Modal
                open={addRobotModalOpen}
                close={() => addRobotModalVisible(false)}
                title="Add Robot"
                content={createAddRobotModalContent()}
                footer={createAddRobotModalFooter()}
            />
            <Modal
                open={removeRobotModalOpen}
                close={() => removeRobotModalVisible(false)}
                title="Remove Robot"
                content={createRemoveRobotModalContent()}
                footer={createRemoveRobotModalFooter()}
            />
            <Modal
                open={renameRobotModalOpen}
                close={() => renameRobotModalVisible(false)}
                title="Rename Robot"
                content={createRenameRobotModalContent()}
                footer={createRenameRobotModalFooter()}
            />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-6">
                        <Card
                            title={
                                <span
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                  <span>Robots</span>
                  <button
                      onClick={() => addRobotModalVisible(true)}
                      className="btn btn-primary"
                  >
                    Add Robot
                  </button>
                </span>
                            }
                            content={
                                <div>
                                    <ul className="list-group">
                                        {reduxRobots
                                            .filter(robot => robot !== undefined)
                                            .map(robot => (
                                                <li key={robot.id} className="list-group-item">
                                                    <img
                                                        src={
                                                            robot.seen_at !== null
                                                                ? green_circle
                                                                : red_circle
                                                        }
                                                        alt="Status"
                                                        style={{marginRight: ".5em"}}
                                                    />
                                                    <h5 style={{ display: "inline" }}>{robot.title}</h5>
                                                    <span className="pull-right">
                                                        <button
                                                            onClick={() => {
                                                                console.log(robot);
                                                                setSelectedRobot(robot);
                                                                renameRobotModalVisible(true)
                                                            }}
                                                            type="button"
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ marginRight: "0.5em" }}
                                                        >
                                                            <i className="glyphicon glyphicon-pencil" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRobot(robot)
                                                                removeRobotModalVisible(true)
                                                            }}
                                                            type="button"
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            <i className="glyphicon glyphicon-trash" />
                                                        </button>
                                                    </span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            }
                        />
                    </div>
                    <div className="col-md-6">
                        <PlantsCard onPlantAdded={onPlantAdded}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <Card
                            title={"Robot Logs"}
                            content={
                                <LoggingTable logs={logs} reduxPlants={reduxPlants} getPlantName={getPlantName}
                                              reduxRobots={reduxRobots} getRobotName={getRobotName}/>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    </>;
};

const mapStateToProps = props => {
    const {robots} = props.robotState;
    const {plants} = props.plantState;
    const {loginToken} = props.auth;
    return {
        reduxRobots: robots,
        loginToken,
        reduxPlants: plants
    };
};

const mapDispatchToProps = dispatch => {
    return {
        reduxAddRobot: robot => dispatch(addRobot(robot)),
        reduxRemoveRobot: robot => dispatch(removeRobot(robot)),
        reduxSelectRobot: robot => dispatch(selectRobot(robot)),
        reduxRenameRobot: (robot, name) => dispatch(renameRobot(robot, name)),
        reduxAddPlant: plant => dispatch(addPlant(plant))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);