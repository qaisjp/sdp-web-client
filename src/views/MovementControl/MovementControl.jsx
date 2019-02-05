import React, { Component } from 'react';
import {withStyles} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import SnackbarContentWrapper from "../../components/Snackbar/CodedSnackbarContents"
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import styles from '../../assets/view-style';
import endpoints from '../../endpoints';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

class MovementControl extends Component {

    state = {
        checkedDetection: false,
        message: "",
        type: "",
        open: false
    }

    onChangeObjectDetection = async() => {
        let objectDetectionActive = !this.state.checkedDetection
        let objectDetectionCommand = {
            id: "c14e69bd-a50b-4ab8-8045-f81fcc2bc668",
            "key": "object_avoidance",
            "value": objectDetectionActive
        }
        let response = await fetch(endpoints.settings, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(objectDetectionCommand)
        });
        console.log(response);
        if(response.status === 200) {
            this.setState({message: "Successfully changed object detection mode", open: true, type: "success"})
        } else {
            this.setState({message: "Failed with error code " + response.status, open: true, type: "error"})
        }
    }


    onMoveForward = async () => {
        let directionCommand = {
            id: "c14e69bd-a50b-4ab8-8045-f81fcc2bc668",
            direction: "forward"
        }

        let response = await fetch(endpoints.move, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(directionCommand)
        });
        console.log(response);
        if(response.status === 200) {
            this.setState({message: "Successfully moved robot forward", open: true, type: "success"})
        } else {
            this.setState({message: "Failed with error code " + response.status, open: true, type: "error"})
        }
    }


    onMoveBackward = async () => {
        let directionCommand = {
            id: "c14e69bd-a50b-4ab8-8045-f81fcc2bc668",
            direction: "backward"
        }

        let response = await fetch(endpoints.move, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(directionCommand)
        });

        console.log(response);

        if(response.status === 200) {
            this.setState({message: "Successfully moved robot backward", open: true, type: "success"})
        } else {
            this.setState({message: "Failed with error code " + response.status, open: true, type: "error"})
        }
    }

    onMoveRight = async () => {
        let directionCommand = {
            id: "c14e69bd-a50b-4ab8-8045-f81fcc2bc668",
            direction: "right"
        }

        let response = await fetch(endpoints.move, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(directionCommand)
        });

        console.log(response);

        if(response.status === 200) {
            this.setState({message: "Successfully moved robot right", open: true, type: "success"})
        } else {
            this.setState({message: "Failed with error code " + response.status, open: true, type: "error"})
        }
    }


    onMoveLeft = async () => {
        let directionCommand = {
            id: "c14e69bd-a50b-4ab8-8045-f81fcc2bc668",
            direction: "left"
        }

        let response = await fetch(endpoints.move, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(directionCommand)
        });

        console.log(response);

        if(response.status === 200) {
            this.setState({message: "Successfully moved robot left", open: true, type: "success"})
        } else {
            this.setState({message: "Failed with error code " + response.status, open: true, type: "error"})
        }
    }

    onBrake = async () => {
        let directionCommand = {
            id: "c14e69bd-a50b-4ab8-8045-f81fcc2bc668",
            direction: "brake"
        }

        let response = await fetch(endpoints.move, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(directionCommand)
        });

        console.log(response);

        if(response.status === 200) {
            this.setState({message: "Successfully braked", open: true, type: "success"})
        } else {
            this.setState({message: "Failed with error code " + response.status, open: true, type: "error"})
        }
    }

    handleClose = () => {
        this.setState({open: false})
    }

    render() {
        let {classes} = this.props;
        return <div className={classes.root}>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.state.open}
                autoHideDuration={6000}
                onClose={this.handleClose}
            >
                <SnackbarContentWrapper
                    onClose={this.handleClose}
                    variant={this.state.type}
                    message={this.state.message}
                />
            </Snackbar>
            <Grid container xs={12} spacing={24}>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            Test GrowBot - 1
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Move Growbot Up by clicking the Move button.
                        </Typography>
                        <Button size="small" onClick={this.onMoveForward}>Move Up</Button>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            Test GrowBot - 2
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Move Growbot Down by clicking the Move button.
                        </Typography>
                        <Button size="small" onClick={this.onMoveBackward}>Move Down</Button>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            Test GrowBot - 3
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Move Growbot left by clicking the Move button.
                        </Typography>
                        <Button size="small" onClick={this.onMoveRight}>Move Left</Button>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            Test GrowBot - 4
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Move Growbot right by clicking the Move button.
                        </Typography>
                        <Button size="small" onClick={this.onMoveLeft}>Move Right</Button>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            Brake
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Run the brakes on the robot
                        </Typography>
                        <Button size="small" onClick={this.onBrake}>Brake</Button>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            Miscellaneous
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Miscellaneous controls for the robot
                        </Typography>
                        <FormControlLabel value="checkedDetection" onChange={this.onChangeObjectDetection}control={<Checkbox />} label="Object Avoidance" />

                    </Paper>
                </Grid>
            </Grid>
            </div>
    }
}

export default withStyles(styles)(MovementControl);
