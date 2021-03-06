import React, {useState} from "react";
import {connect} from "react-redux";

import Card from "../../components/Card/Card.jsx";

import httpAddPlant from "../../http/add_plant";
import httpRenamePlant from "../../http/rename_plant";
import httpRemovePlant from "../../http/remove_plant";

import renamePlant from "../../actions/rename_plant";
import removePlant from "../../actions/remove_plant";

import PlantsAdd from "./PlantsAdd";
import PlantsRemove from "./PlantsRemove";
import PlantsRename from "./PlantsRename"
import PlantsPrint from "./PlantsPrint.jsx";

import WaterImg from "../../assets/img/water.svg";

const PlantsCard = props => {
    const [selectedPlant, selectPlant] = useState({});
    const [modal, setModal] = useState({});
    const [renamePlantText, setRenamePlantText] = useState("");

    const {loginToken, plants, onPlantAdded} = props;

    const reduxPlants = plants;
    const resetModal = () => setModal({});
    const modalData = () => {
        const {name, ...data} = modal;
        return data;
    }
    const modalName = () => {
        const {name, ...data} = modal;
        return name;
    }

    const onRenamePlant = async (renamePlantName) => {
        console.log(reduxPlants);
        if (renamePlantName === "") {
            // todo: improve alert
            alert("Please make sure you've typed in a new name!");
            return;
        }

        const {reduxRenamePlant} = props;

        const response = await httpRenamePlant(
            loginToken,
            selectedPlant.id,
            renamePlantName
        );

        if (response.status === 200) {
            reduxRenamePlant(selectedPlant, renamePlantName);
        }

        resetModal();
    };
    const onRemovePlant = async () => {
        const {reduxRemovePlant} = props;

        const response = await httpRemovePlant(loginToken, selectedPlant.id);

        if (response.status === 200) {
            reduxRemovePlant(selectedPlant);
        }

        resetModal();
    };

    const onAddPlant = async name => {
        if (name === "") {
            // todo: improve alert
            alert("Please make sure you've entered a name for your new plant!");
            return;
        }

        const response = await httpAddPlant(loginToken, name);

        if (response.status === 200) {
            onPlantAdded();
        }

        const data = await response.json();
        setModal({ name: "print", plant: {id: data.id, name} })
    };

    const MiniButton = ({icon, onClick, color}) => {
        return (
            <button
                onClick={onClick}
                type="button"
                className={`btn btn-sm btn-${color}`}
                style={{marginLeft: "0.5em"}}
            >
                <i className={`glyphicon glyphicon-${icon}`}/>
            </button>
        );
    }

    return (
        <React.Fragment>
            <Card
                title={
                    <span
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
            <span>Plants</span>
            <button
                onClick={() => setModal({ name: "add" })}
                className="btn btn-primary"
            >
              Add Plant
            </button>
          </span>
                }
                content={
                    <div>
                        <ul className="list-group">
                            {reduxPlants
                                .filter(plant => plant !== undefined)
                                .map((plant, idx) => (
                                    <li key={idx} className="list-group-item" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                        {plant.name}
                                        <span>
                                            {
                                                plant.soil_moisture && <span style={{ marginRight: "0.5em" }}>
                                                    <img src={WaterImg} alt="Water by abdul karim from the Noun Project" width="10"></img>
                                                    {" "}{plant.soil_moisture}%
                                                </span>
                                            }
                                            <MiniButton icon="print" color="secondary"
                                                onClick={() => {
                                                    const plant = reduxPlants[idx];
                                                    selectPlant(plant);
                                                    setModal({ name: "print", plant })
                                                }}
                                            />
                                            <MiniButton icon="pencil" color="secondary"
                                                onClick={() => {
                                                    const plant = reduxPlants[idx];
                                                    selectPlant(plant);
                                                    setRenamePlantText(plant.name);
                                                    setModal({ name: "rename" });
                                                }}
                                            />
                                            <MiniButton icon="trash" color="danger"
                                                onClick={() => {
                                                    const plant = reduxPlants[idx];
                                                    selectPlant(plant);
                                                    setModal({ name: "remove" });
                                                }}
                                            />
                                        </span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                }
            />

            <PlantsAdd
                onSubmit={onAddPlant}
                visible={modalName() === "add"}
                onClose={resetModal}
            />
            <PlantsPrint
                visible={modalName() === "print"}
                onClose={resetModal}
                {...modalData()}
            />
            <PlantsRename
                onSubmit={onRenamePlant}
                visible={modalName() === "rename"}
                onClose={resetModal}
                defaultText={renamePlantText}
            />
            <PlantsRemove
                onSubmit={onRemovePlant}
                visible={modalName() === "remove"}
                onClose={resetModal}
            />
        </React.Fragment>
    );
};

const mapStateToProps = state => {
    const {
        auth: {loginToken},
        plantState: {plants}
    } = state;
    return {plants, loginToken};
};

const mapDispatchToProps = dispatch => {
    return {
        reduxRemovePlant: plant => dispatch(removePlant(plant)),
        reduxRenamePlant: (plant, name) => dispatch(renamePlant(plant, name))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlantsCard);
