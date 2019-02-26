import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Snackbar from '@material-ui/core/Snackbar';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import SnackbarContentWrapper from "../../components/Snackbar/CodedSnackbarContents"

import styles from '../../assets/views/Login/login-style'
import login from '../../actions/login_auth'

class Login extends Component {

    state = {
        email: null,
        password: null,
        type: null,
        message: null,
        open: false
    }

    render() {
        const { classes, loginError } = this.props;

        if(loginError && !this.state.open) {
            console.log(loginError);
            let errorObj = JSON.parse(loginError);
            this.setState({open: true, message: errorObj.message, type: "error"});
        }

        return (
            <main className={classes.main}>
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
                <CssBaseline />
                <Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <form className={classes.form}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="email">Email Address</InputLabel>
                            <Input id="email" name="email" autoComplete="email" onChange={e => this.setState({email: e.target.value})} autoFocus />
                        </FormControl>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <Input name="password" type="password" id="password" onChange={e => this.setState({password: e.target.value})} autoComplete="current-password" />
                        </FormControl>
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={()=>this.props.authLogin(this.state.email, this.state.password)}
                        >
                            Sign in
                        </Button>
                        <br/>
                        <br/>
                        <Typography>
                            <Link component={RouterLink} to="/register" className={classes.link}>
                                Register
                            </Link>
                            <Link component={RouterLink} to="/recover" className={classes.link}>
                                Forgot Your Password
                            </Link>
                        </Typography>
                    </form>
                </Paper>
            </main>
        );
    }
}

function mapStateToProps(state) {
    return {
        isLoginPending: state.auth.isLoginPending,
        isLoginSuccess: state.auth.isLoginSuccess,
        loginError: state.auth.loginError
    }
}

function mapDispatchToProps(dispatch) {
    return {
        authLogin: (email, password) => dispatch(login(email, password))
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps) (withStyles(styles)(Login));