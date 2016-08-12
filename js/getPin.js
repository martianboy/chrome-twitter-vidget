window.onload = function() {
    var el = document.querySelector("#oauth_pin kbd code");

    if (el) {
        chrome.runtime.sendMessage({
            type: 'getPin:done',
            pin: el.innerText
        }, () => {});
    }
}