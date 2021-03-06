import endpoints from "../endpoints";

export default async function (email, password, callback) {
    const loginRequest = {
        email,
        password
    };
    const response = await fetch(endpoints.auth_login, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginRequest)
    });
    if (response.status === 200) {
        response.json().then(body => {
            callback(body.token);
        });
    } else {
        response.text().then(msg => {
            callback("Error: " + msg);
        });
    }
}
