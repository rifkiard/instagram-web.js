module.exports = () => {
    window.IGJS = {}

    window.IGJS.closeNotificationPrompt = () => {
        const h2s = document.querySelectorAll("h2");

        for (var h2Index = 0; h2Index < h2s.length; h2Index++) {
            var text = h2s[h2Index].innerText || h2s[h2Index].textContent;

            if (text.toLowerCase().trim() == "turn on notifications") {

                const buttons = document.querySelectorAll('button');

                for (var buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
                    var text = buttons[buttonIndex].innerText || buttons[buttonIndex].textContent;
                    if (text.toLowerCase().trim() == "not now") {
                        buttons[buttonIndex].click();

                        return true;
                    }
                }
            }
        }

        return null;
    }

    window.IGJS.getUserPicture = (username) => {
        const imgs = document.querySelectorAll("img");

        for (var i = 0; i < imgs.length; i++) {
            if (imgs[i].alt == `${username}'s profile picture`) {
                return imgs[i].src;
            }
        }

        return null;
    }

    window.IGJS.clickSelectFromComputerButton = () => {
        const tags = document.querySelectorAll("button");

        for (var i = 0; i < tags.length; i++) {
            if (tags[i].innerText.toLowerCase().trim() == `select from computer`) {
                return tags[i].click();
            }
        }

        return null;
    }

    window.IGJS.clickNextButton = () => {
        const tags = document.querySelectorAll("button");

        for (var i = 0; i < tags.length; i++) {
            if (tags[i].innerText.toLowerCase().trim() == `next`) {
                return tags[i].click();
            }
        }

        return null;
    }

    window.IGJS.openNewPostModal = () => {
        const button = document.querySelector("svg[aria-label='New post']")

        if (!button) {
            return null;
        }

        button.closest('a').click();
        return true;
    }
}