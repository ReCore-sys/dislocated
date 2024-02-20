import { setCookie, getHash } from "./utils.mts";

$("#login_form").on("submit", submit_login);

export function submit_login(e) {
    e.preventDefault();
    console.log("submit_login");
    var username = $("#username").val()! as string;
    if (username.includes("&") || username.includes("?")) {
        alert("Username cannot contain '&' or '?'");
        return;
    }
    var password = $("#password").val();
    var combined = username + ":" + password;
    const hash = getHash(combined);

    var hashString = hash.toString();
    var base64 = btoa(hashString);
    setCookie("username", username, 1);
    setCookie("uuid", base64, 1);
    window.location.href = "./main.html";
}
