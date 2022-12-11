'use strict'

class InterfaceController {

    constructor({ client }) {
        this.client = client;
    }

    /**
     * Close the "Turn on Notification" prompt when it's displayed.
     */
    closeNotificationPrompt() {
        const h2s = document.querySelectorAll("h2");
        h2s.forEach(el => {
            var text = el.innerText || el.textContent;

            if (text.toLowerCase().trim() == "turn on notifications") {

                const buttons = document.querySelectorAll('button');

                buttons.forEach(el => {
                    var text = el.innerText || el.textContent;
                    if (text.toLowerCase().trim() == "not now") {
                        el.click();
                    }
                })
            }
        })
    }

    /**
     * Get the URL of user profile picture.
     * @param  {string} username Username of targeted user.
     */
    getUserPicture(username) {
        const imgs = document.querySelectorAll("img");

        for (var i = 0; i < imgs.length; i++) {
            if (imgs[i].alt == `${username}'s profile picture`) {
                return imgs[i].src;
            }
        }

        return null;
    }

    openNewPostModal() {
        const button = document.querySelector("svg[aria-label='New post']")

        if (!button) {
            return null;
        }

        button.closest('a').click();
        return true;
    }
}

module.exports = InterfaceController;