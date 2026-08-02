(function () {

    const overlay = document.getElementById("videoOverlay");
    const playButton = document.getElementById("playButton");

    playButton.addEventListener("click", function () {

        /*
         * Overlay remove
         */
        overlay.classList.add("hide");

        /*
         * iframe autoplay করার চেষ্টা
         */
        const iframe = document.querySelector(".video-box iframe");

        if (iframe) {

            let currentSrc = iframe.getAttribute("src");

            if (currentSrc && !currentSrc.includes("autoplay=1")) {

                iframe.setAttribute(
                    "src",
                    currentSrc +
                    (currentSrc.includes("?") ? "&" : "?") +
                    "autoplay=1"
                );

            }
        }

    });

})();
