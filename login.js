async function getHash(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return hash;
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function encrypt(text, key) {
    return [...text]
        .map((x, i) =>
            (x.codePointAt() ^ key.charCodeAt(i % key.length) % 255)
                .toString(16)
                .padStart(2, "0")
        )
        .join("");
}
function decrypt(text, key) {
    return String.fromCharCode(
        ...text
            .match(/.{1,2}/g)
            .map(
                (e, i) => parseInt(e, 16) ^ key.charCodeAt(i % key.length) % 255
            )
    );
}
const parent_path = window.location.pathname.split("/").slice(0, -1).join("/");

function submit_login(e) {
    console.log("submit_login");
    var username = $("#username").val();
    if (username.includes("&") || username.includes("?")) {
        alert("Username cannot contain '&' or '?'");
        return;
    }
    var password = $("#password").val();
    var combined = username + ":" + password;
    getHash(combined).then(function (hash) {
        var hashString = hash.toString();
        var base64 = btoa(hashString);
        window.location.href =
            "./main.html" + "?" + encrypt(username + "&" + base64, parent_path);
    });
}
