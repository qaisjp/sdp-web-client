import React, { Component } from "react";

import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListSubheader from "@material-ui/core/ListSubheader";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import RemoveIcon from "@material-ui/icons/Remove";
import Avatar from "@material-ui/core/Avatar";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import { withStyles } from "@material-ui/core";

import DateTimePicker from "react-datetime-picker";

import SnackbarContentWrapper from "../../components/Snackbar/CodedSnackbarContents";

import endpoints from "../../endpoints";
import styles from "../../assets/views/Dashboard/jss/dashboard-style";
import banner from "../../assets/views/Dashboard/img/banner.jpg";
import online from "../../assets/views/Dashboard/img/green_circle.png";
import offline from "../../assets/views/Dashboard/img/red_circle.png";

import Dialogue from "../../components/Dialogue/Dialogue";
import Gamepad from "../../components/Gamepad/Gamepad";
import LetterIcon from "../../components/Icon/LetterIcon";
import Select from "../../components/Select/Select";

import { connect } from "react-redux";

import QrReader from "react-qr-reader";

import fetchRobots from "../../http/fetch_robots";
import moveRobot from "../../http/move_robot";
import addRobot from "../../http/add_robot";
import removeRobot from "../../http/remove_robot";

class Dashboard extends Component {
  state = {
    checkedMonday: false,
    checkedTuesday: false,
    checkedWednesday: false,
    checkedThursday: false,
    checkedFriday: false,
    checkedSaturday: false,
    checkedSunday: false,
    repetitionQuantity: null,
    repetitionUnit: null,
    repetitionEnd: "never",
    action: "",
    checkedDetection: false,
    message: "",
    type: "",
    open: false,
    addRobotDialogue: false,
    removeRobotDialogue: false,
    scheduleRobotDialogue: false,
    selectedRobotId: null,
    selectedRobot: null,
    robots: [],
    searchFilter: null,
    newRobotSerialKey: "",
    newRobotTitle: "",
    date: new Date(),
    qrDelay: 300
  };
  onMove = async direction => {
    const { loginToken } = this.props;
    const { selectedRobotId } = this.state;
    const response = await moveRobot(loginToken, direction, selectedRobotId);

    if (response.status === 200) {
      this.setState({
        message: "Successfully moved robot",
        open: true,
        type: "success"
      });
    } else {
      const body = await response.json();
      this.setState({ message: body.message, open: true, type: "error" });
    }
  };
  handleClose = () => {
    this.setState({ open: false });
  };
  handleOpenDialogue = dialogue => {
    this.setState({ [dialogue]: true });
  };
  handleCloseDialogue = dialogue => {
    this.setState({ [dialogue]: false });
  };
  handleListItemClick = (event, robot) => {
    this.setState({ selectedRobotId: robot.id, selectedRobot: robot });
  };
  componentDidMount = async () => {
    const { loginToken } = this.props;
    const result = await fetchRobots(loginToken);

    if (result instanceof Error) {
      this.setState({ robots: [] });
    } else {
      const { robots } = result;
      this.setState({ robots });
      if (robots.length > 0) {
        this.handleListItemClick(null, result.robots[0]);
      }
    }
  };
  isRobotOnline = robot => {
    return robot.seen_at !== null;
  };
  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };
  handleChecked = name => event => {
    this.setState({ [name]: event.target.checked });
  };
  onAddRobot = async () => {
    const { loginToken } = this.props;
    const { newRobotSerialKey, newRobotTitle } = this.state;
    const response = await addRobot(
      loginToken,
      newRobotSerialKey,
      newRobotTitle
    );

    if (response.status === 200) {
      const result = await fetchRobots(loginToken);

      if (result instanceof Error) {
        this.setState({ robots: [] });
      } else {
        //this.handleDialogClose()
        this.setState({ robots: result.robots });

        const found = result.robots.filter(r => r.id === newRobotSerialKey);
        if (found.length === 1) {
          this.handleListItemClick(null, found[0]);
        }
      }
    } else {
      const body = await response.json();
      this.setState({ message: body.message, open: true, type: "error" });
    }
  };
  onRemoveRobot = async () => {
    const { loginToken } = this.props;
    const { selectedRobotId } = this.state;

    const response = await removeRobot(loginToken, selectedRobotId);

    if (response.status === 200) {
      let result = await fetchRobots(loginToken);

      if (result instanceof Error) {
        this.setState({ robots: [], dialogOpen: false });
      } else {
        this.setState({ robots: result.robots, dialogOpen: false });
      }
    } else {
      const body = await response.json();
      this.setState({ message: body.message, open: true, type: "error" });
    }
  };
  handleDialogOpenRename = async () => {
    const newTitle = prompt(
      "Rename this robot",
      this.state.selectedRobot.title
    );
    if (
      newTitle === null ||
      newTitle === "" ||
      newTitle === this.state.selectedRobot.title
    ) {
      this.setState({ message: "Robot not renamed", open: true, type: "info" });
      return;
    }

    let response = await fetch(
      endpoints.robot_settings(this.state.selectedRobot.id),
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + this.props.loginToken
        },
        body: JSON.stringify({
          key: "title",
          value: newTitle
        })
      }
    );

    if (response.status === 200) {
      let result = await fetchRobots(this.props.loginToken);

      if (result instanceof Error) {
        this.setState({ robots: [] });
      } else {
        const thisID = this.state.selectedRobot.id;
        this.setState({
          robots: result.robots,
          message: (await response.json()).message,
          open: true,
          type: "success"
        });
        const found = result.robots.filter(r => r.id === thisID);
        if (found.length === 1) {
          this.handleListItemClick(null, found[0]);
        }
      }
    } else {
      this.setState({
        message: (await response.json()).message,
        open: true,
        type: "error"
      });
    }
  };
  createTextField = (id, label, value, valueName) => {
    const { classes } = this.props;
    return (
      <TextField
        id={id}
        label={label}
        className={classes.textField}
        value={value}
        onChange={this.handleChange(valueName)}
        margin="normal"
      />
    );
  };
  createLetterCheckbox = (letter, state, value) => {
    return (
      <Checkbox
        icon={<LetterIcon letter={letter} color="#000000" />}
        checkedIcon={<LetterIcon letter={letter} color="#006600" />}
        checked={state}
        onChange={this.handleChecked(value)}
        value={value}
      />
    );
  };
  createAddRobotDialogueContent = () => {
    const { newRobotSerialKey, newRobotTitle } = this.state;
    const addRobotSerialKeyTextField = this.createTextField(
      "addRobot",
      "Serial key",
      newRobotSerialKey,
      "newRobotSerialKey"
    );
    const addRobotTitleTextField = this.createTextField(
      "addRobotTitle",
      "Title",
      newRobotTitle,
      "newRobotTitle"
    );

    return (
      <React.Fragment>
        <QrReader
          delay={this.state.qrDelay}
          onError={Dashboard.qrHandleError}
          onScan={this.qrHandleScan.bind(this)}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {addRobotSerialKeyTextField}
          {addRobotTitleTextField}
        </div>
      </React.Fragment>
    );
  };
  createAddRobotDialogueActions = () => {
    return (
      <React.Fragment>
        <Button onClick={() => this.handleCloseDialogue("addRobotDialogue")}>
          Close
        </Button>
        <Button onClick={this.onAddRobot}>Add</Button>
      </React.Fragment>
    );
  };
  createRemoveRobotDialogueActions = () => {
    return (
      <React.Fragment>
        <Button onClick={() => this.handleCloseDialogue("removeRobotDialogue")}>
          Close
        </Button>
        <Button onClick={this.onRemoveRobot}>Rebot</Button>
      </React.Fragment>
    );
  };
  createRemoveRobotDialogueContent = () => {
    return <React.Fragment />;
  };
  createScheduleRobotDialogueActions = () => {
    return (
      <React.Fragment>
        <Button
          onClick={() => this.handleCloseDialogue("scheduleRobotDialogue")}
        >
          Close
        </Button>
        <Button>Schedule</Button>
      </React.Fragment>
    );
  };
  createScheduleRobotDialogueContent = () => {
    const { classes } = this.props;

    const {
      checkedMonday,
      checkedTuesday,
      checkedWednesday,
      checkedThursday,
      checkedFriday,
      checkedSaturday,
      checkedSunday,
      repetitionQuantity,
      repetitionUnit,
      action
    } = this.state;
    const repetitionQuantityItems = [1, 2, 3, 4, 5, 6, 7].map(quantity => (
      <MenuItem value={quantity}>{quantity}</MenuItem>
    ));
    const repetitionUnitItems = ["Week"].map(unit => (
      <MenuItem value={unit}>{unit}</MenuItem>
    ));
    const checkboxes = [
      { letter: "M", state: checkedMonday, value: "checkedMonday" },
      {
        letter: "T",
        state: checkedTuesday,
        value: "checkedTuesday"
      },
      { letter: "W", state: checkedWednesday, value: "checkedWednesday" },
      {
        letter: "T",
        state: checkedThursday,
        value: "checkedThursday"
      },
      { letter: "F", state: checkedFriday, value: "checkedFriday" },
      {
        letter: "S",
        state: checkedSaturday,
        value: "checkedSaturday"
      },
      { letter: "S", state: checkedSunday, value: "checkedSunday" }
    ].map(day => (
      <Grid item>
        {this.createLetterCheckbox(day.letter, day.state, day.value)}
      </Grid>
    ));
    const actions = ["Water", "Take Picture"].map(action => (
      <MenuItem value={action}>{action}</MenuItem>
    ));
    return (
      <React.Fragment>
        <Grid container>
          <Grid item>
            <InputLabel>Repeat every</InputLabel>
          </Grid>
          <Grid item>
            <Select
              value={repetitionQuantity}
              onChange={event =>
                this.setState({ repetitionQuantity: event.target.value })
              }
              name="repetition_quantity"
              id="repetition_quantity"
              items={repetitionQuantityItems}
            />
          </Grid>
          <Grid item>
            <Select
              value={repetitionUnit}
              onChange={event =>
                this.setState({ repetitionUnit: event.target.value })
              }
              name="repetition_unit"
              id="repetition_unit"
              items={repetitionUnitItems}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <InputLabel>Repeat on</InputLabel>
          </Grid>
          {checkboxes}
        </Grid>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Ends</FormLabel>
          <RadioGroup
            aria-label="Ends"
            name="ends"
            className={classes.group}
            value={this.state.repetitionEnd}
            onChange={x => this.setState({ repetitionEnd: x.target.value })}
          >
            <FormControlLabel value="never" control={<Radio />} label="Never" />
            <FormControlLabel value="on" control={<Radio />} label="On" />
            <DateTimePicker
              onChange={date => this.setState({ date })}
              value={this.state.date}
            />
            <FormControlLabel value="after" control={<Radio />} label="After" />
          </RadioGroup>
        </FormControl>
        <Grid container>
          <Grid item>
            <InputLabel htmlFor="action">Action</InputLabel>
          </Grid>
          <Grid item>
            <Select
              value={action}
              onChange={event => this.setState({ action: event.target.value })}
              name="action"
              id="action"
              items={actions}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  };

  createSchedulingList = () => {
    const { classes } = this.props;

    return (
      <List
        className={classes.root}
        subheader={<ListSubheader component="div">Tasks</ListSubheader>}
      >
        <ListItem key="1">
          <ListItemText primary="Water Plant A every 3 hours" />
          <ListItemSecondaryAction>
            <IconButton aria-label="Edit">
              <EditIcon />
            </IconButton>
            <IconButton aria-label="Remove">
              <RemoveIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem key="2">
          <ListItemText primary="Water Plant B every 6 hours" />
          <ListItemSecondaryAction>
            <IconButton aria-label="Edit">
              <EditIcon />
            </IconButton>
            <IconButton aria-label="Remove">
              <RemoveIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem key="1">
          <ListItemText primary="Take Picture of Plant A every 3 hours" />
          <ListItemSecondaryAction>
            <IconButton aria-label="Edit">
              <EditIcon />
            </IconButton>
            <IconButton aria-label="Remove">
              <RemoveIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    );
  };

  createPlantList = () => {
    const { classes } = this.props;
    return (
      <List
        className={classes.root}>
        <ListItem
          key="a"
          alignItems="flex-start"
          button
          selected={true}
        >
          <ListItemText
            primary="Sunflower"
            secondary="Sunflower"
            />
        </ListItem>
        <ListItem
          key="b"
          alignItems="flex-start"
          button
          selected={false}
        >
          <ListItemText
            primary="Rose"
            secondary="Rose"
          />
        </ListItem>
      </List>
    );
  };

  createRobotList = () => {
    const { classes } = this.props;
    const { robots, selectedRobotId } = this.state;
    return (
      <List className={classes.root}>
        {robots.map(robot => (
          <ListItem
            key={robot.id}
            alignItems="flex-start"
            button
            selected={selectedRobotId === robot.id}
            onClick={event => this.handleListItemClick(event, robot)}
          >
            <ListItemAvatar>
              <Avatar src={this.isRobotOnline(robot) ? online : offline} />
            </ListItemAvatar>
            <ListItemText
              primary={robot.title}
              secondary={
                robot.seen_at === null ? (
                  <React.Fragment>Please start this growbot</React.Fragment>
                ) : (
                  <React.Fragment>
                    {`Charge: ${robot.battery_level}%; Water Volume: ${
                      robot.water_level
                    }ml`}
                  </React.Fragment>
                )
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  createGamepad = () => {
    return (
      <Gamepad
        forward={this.onMove.bind(this, "forward")}
        backward={this.onMove.bind(this, "backward")}
        armdown={this.onMove.bind(this, "armdown")}
        armup={this.onMove.bind(this, "armup")}
        left={this.onMove.bind(this, "left")}
        right={this.onMove.bind(this, "right")}
        brake={this.onMove.bind(this, "brake")}
      />
    );
  };

  createCardHeader = () => {
    const { classes } = this.props;
    return (
      <CardMedia
        className={classes.media}
        image={banner}
        title={"Controller"}
        width="100%"
      />
    );
  };

  qrHandleScan(data) {
    const prefix = "growbot:";
    if (data && data.startsWith(prefix)) {
      this.setState({
        newRobotSerialKey: data.slice(prefix.length)
      });
    }
  }

  static qrHandleError(err) {
    alert(err);
  }

  render() {
    const { classes, loginToken } = this.props;
    const {
      type,
      message,
      open,
      searchFilter,
      selectedRobot,
      selectedRobotId,
      addRobotDialogue,
      removeRobotDialogue,
      scheduleRobotDialogue
    } = this.state;
    const robotSearchCriteria = this.createTextField(
      "search-criteria",
      "Filter",
      searchFilter,
      this.handleChange("searchFilter")
    );
    const schedulingList = this.createSchedulingList();
    const robotList = this.createRobotList();
    const gamepad = this.createGamepad();
    const cardHeader = this.createCardHeader();
    const plantList = this.createPlantList();
    let controller = null;

    if (selectedRobotId !== null) {
      controller = [
        <Grid item>
          <Card className={classes.card}>
            {cardHeader}

            <CardContent>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <Typography gutterBottom variant="h5" component="h2">
                    {selectedRobot.title}
                  </Typography>
                  <Typography component="p">
                    Move Growbot around.
                  </Typography>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Button
                    size="medium"
                    color="secondary"
                    onClick={() => this.handleOpenDialogue("rename")}
                  >
                    Rename
                  </Button>
                  <Button
                    size="medium"
                    color="secondary"
                    onClick={() =>
                      this.handleOpenDialogue("removeRobotDialogue")
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardActions>
              {gamepad}
            </CardActions>
          </Card>
        </Grid>,
        <Grid item>
          <Card className={classes.card}>
            {cardHeader}

            <CardContent>
              <div>
                <Typography gutterBottom variant="h5" component="h2">
                  Video
                </Typography>
                <Typography component="p">
                  Live stream from {selectedRobot.title}
                </Typography>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  alt="Video stream"
                  src={endpoints.robot_video(selectedRobot.id, loginToken)}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>,
        <Grid item>
          <Card className={classes.card}>
            {cardHeader}

            <CardContent>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <Typography gutterBottom variant="h5" component="h2">
                    Scheduler
                  </Typography>
                  <Typography component="p">
                    Assign tasks to Growbot.
                  </Typography>
                  {robotSearchCriteria}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <IconButton
                    aria-label="Add"
                    onClick={() => {
                      this.handleOpenDialogue("scheduleRobotDialogue");
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </div>
              </div>

              {schedulingList}
            </CardContent>
          </Card>
        </Grid>
      ];
    }

    return (
      <div className={classes.root}>
        <br />
        <Dialogue
          open={addRobotDialogue}
          close={() => this.handleCloseDialogue("addRobotDialogue")}
          title="Add Robot"
          contentText="Please scan the robot serial and name your robot."
          content={this.createAddRobotDialogueContent()}
          actions={this.createAddRobotDialogueActions()}
        />
        <Dialogue
          open={removeRobotDialogue}
          close={() => this.handleCloseDialogue("removeRobotDialogue")}
          title="Remove Robot"
          contentText="Please confirm you wish to remove the robot."
          content={this.createRemoveRobotDialogueContent()}
          actions={this.createRemoveRobotDialogueActions()}
        />
        <Dialogue
          open={scheduleRobotDialogue}
          close={() => this.handleCloseDialogue("scheduleRobotDialogue")}
          title="Schedule Action"
          contentText="Please fill in the form to schedule an action."
          content={this.createScheduleRobotDialogueContent()}
          actions={this.createScheduleRobotDialogueActions()}
        />

        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          open={open}
          autoHideDuration={6000}
          onClose={this.handleClose}
        >
          <SnackbarContentWrapper
            onClose={this.handleClose}
            variant={type}
            message={message}
          />
        </Snackbar>
        <Grid container>
          <Grid item>
            <Card className={classes.card}>
              {cardHeader}
              <CardContent>
                <div>
                  <Typography gutterBottom variant="h5" component="h2">
                    Plants
                  </Typography>
                  <Typography component="p">
                    Your plants
                  </Typography>
                </div>

                {plantList}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={24}>
          <Grid item>
            <Card className={classes.card}>
              {cardHeader}

              <CardContent>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <Typography gutterBottom variant="h5" component="h2">
                      Robots
                    </Typography>
                    <Typography component="p">
                      {this.state.robots.length === 0
                        ? "Please add some GrowBots"
                        : "Select a GrowBot"}
                    </Typography>
                  </div>
                  <IconButton
                    aria-label="Add-Robot"
                    onClick={() => this.handleOpenDialogue("addRobotDialogue")}
                  >
                    <AddIcon />
                  </IconButton>
                </div>
              </CardContent>

              <CardActions>{robotList}</CardActions>
            </Card>
          </Grid>

          {controller}
        </Grid>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoginPending: state.auth.isLoginPending,
    isLoginSuccess: state.auth.isLoginSuccess,
    loginError: state.auth.loginError,
    loginToken: state.auth.loginToken
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Dashboard));
