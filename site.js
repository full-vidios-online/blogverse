(function () {

  'use strict';


  /* ========================================================
     FIND VIDEO BOXES
  ======================================================== */

  const boxes =
    document.querySelectorAll(
      '.video-unlock-box'
    );


  boxes.forEach(function (box) {


    /* ======================================================
       POST ID
    ====================================================== */

    const POST_ID =
      box.getAttribute(
        'data-post-id'
      );


    if (!POST_ID) {

      console.error(
        'Video Unlock Error: data-post-id missing.'
      );

      return;

    }


    /* ======================================================
       STORAGE
    ====================================================== */

    const STORAGE = {

      completed:
        'video_unlock_' +
        POST_ID +
        '_completed',

      status:
        'video_unlock_' +
        POST_ID +
        '_status',

      pending:
        'video_unlock_' +
        POST_ID +
        '_pending',

      startTime:
        'video_unlock_' +
        POST_ID +
        '_start_time',

      unlockTime:
        'video_unlock_' +
        POST_ID +
        '_unlock_time'

    };


    /* ======================================================
       CONFIG
    ====================================================== */

    const CONFIG = {

      /* Total advertisements */

      totalAds: 3,


      /*
        Advertisement waiting time

        5 seconds
      */

      requiredTimeMs:
        5 * 1000,


      /*
        Unlock duration

        1 hour
      */

      unlockDurationMs:
        60 * 60 * 1000,


      /*
        Advertisement URLs

        নিজের ad links বসান
      */

      adLinks: [

        'https://example.com/link1',

        'https://example.com/link2',

        'https://example.com/link3'

      ]

    };


    /* ======================================================
       DOM
    ====================================================== */

    const unlockOverlay =
      box.querySelector(
        '.video-overlay'
      );


    const unlockBtn =
      box.querySelector(
        '.unlock-button'
      );


    const popupOverlay =
      box.querySelector(
        '.unlock-popup'
      );


    const popupTotal =
      box.querySelector(
        '.popupTotal'
      );


    const popupCompleted =
      box.querySelector(
        '.popupCompleted'
      );


    const popupRemaining =
      box.querySelector(
        '.popupRemaining'
      );


    const popupAdBtn =
      box.querySelector(
        '.popup-ad-button'
      );


    const popupBtnText =
      box.querySelector(
        '.popupBtnText'
      );


    const popupError =
      box.querySelector(
        '.popup-error'
      );


    const popupErrorText =
      box.querySelector(
        '.popupErrorText'
      );


    const progressFill =
      box.querySelector(
        '.progress-fill'
      );


    const popupClose =
      box.querySelector(
        '.popup-close'
      );


    /* ======================================================
       STATE
    ====================================================== */

    let state = {

      completedAds:

        parseInt(
          localStorage.getItem(
            STORAGE.completed
          ),
          10
        ) || 0,


      isUnlocked:

        localStorage.getItem(
          STORAGE.status
        ) === 'true',


      isAdPending:

        localStorage.getItem(
          STORAGE.pending
        ) === 'true',


      adStartTime:

        parseInt(
          localStorage.getItem(
            STORAGE.startTime
          ),
          10
        ) || null,


      unlockTime:

        parseInt(
          localStorage.getItem(
            STORAGE.unlockTime
          ),
          10
        ) || null

    };


    /* ======================================================
       SAVE
    ====================================================== */

    function saveState() {

      localStorage.setItem(
        STORAGE.completed,
        state.completedAds
      );

      localStorage.setItem(
        STORAGE.status,
        state.isUnlocked
      );

      localStorage.setItem(
        STORAGE.pending,
        state.isAdPending
      );

      localStorage.setItem(
        STORAGE.startTime,
        state.adStartTime || ''
      );

      localStorage.setItem(
        STORAGE.unlockTime,
        state.unlockTime || ''
      );

    }


    /* ======================================================
       RESET
    ====================================================== */

    function resetState() {

      state.completedAds = 0;

      state.isUnlocked = false;

      state.isAdPending = false;

      state.adStartTime = null;

      state.unlockTime = null;

      saveState();

    }


    /* ======================================================
       EXPIRY
    ====================================================== */

    function checkUnlockExpiry() {

      if (!state.isUnlocked) {

        return;

      }


      if (!state.unlockTime) {

        resetState();

        return;

      }


      const elapsed =
        Date.now() -
        state.unlockTime;


      if (
        elapsed >=
        CONFIG.unlockDurationMs
      ) {

        resetState();

        updateUI();

      }

    }


    /* ======================================================
       UPDATE UI
    ====================================================== */

    function updateUI() {

      const remaining =
        Math.max(
          0,
          CONFIG.totalAds -
          state.completedAds
        );


      const progress =
        Math.min(
          100,
          (
            state.completedAds /
            CONFIG.totalAds
          ) * 100
        );


      progressFill.style.width =
        progress + '%';


      /* VIDEO */

      if (state.isUnlocked) {

        unlockOverlay.classList.add(
          'hidden'
        );

        unlockBtn.disabled = true;

        unlockBtn.querySelector(
          'i'
        ).className =
          'fa-solid fa-circle-check';

        unlockBtn.querySelector(
          'span'
        ).textContent =
          'Video Unlocked';

      }

      else {

        unlockOverlay.classList.remove(
          'hidden'
        );

        unlockBtn.disabled = false;

        unlockBtn.querySelector(
          'i'
        ).className =
          'fa-solid fa-unlock';

        unlockBtn.querySelector(
          'span'
        ).textContent =
          'Unlock Video';

      }


      /* NUMBERS */

      popupTotal.textContent =
        CONFIG.totalAds;


      popupCompleted.textContent =
        state.completedAds;


      popupRemaining.textContent =
        remaining;


      /* AD BUTTON */

      if (remaining > 0) {

        if (state.isAdPending) {

          popupBtnText.textContent =
            'Return after waiting...';

        }

        else {

          popupBtnText.textContent =
            'Watch Advertisement (3 left)';

        }


        popupAdBtn.disabled =
          state.isAdPending;

      }

      else {

        popupBtnText.textContent =
          'All Advertisements Completed';

        popupAdBtn.disabled = true;

      }

    }


    /* ======================================================
       MESSAGE
    ====================================================== */

    function showMessage(
      message,
      type
    ) {

      popupErrorText.textContent =
        message;


      popupError.style.display =
        'flex';


      if (type === 'success') {

        popupError.style.borderColor =
          '#a7f3d0';

        popupError.style.color =
          '#047857';

        popupError.style.background =
          '#ecfdf5';

        popupError.querySelector(
          'i'
        ).className =
          'fa-solid fa-circle-check';

      }

      else {

        popupError.style.borderColor =
          '#fecdd3';

        popupError.style.color =
          '#be123c';

        popupError.style.background =
          '#fff1f2';

        popupError.querySelector(
          'i'
        ).className =
          'fa-solid fa-circle-exclamation';

      }


      clearTimeout(
        box._messageTimer
      );


      box._messageTimer =
        setTimeout(
          function () {

            popupError.style.display =
              'none';

          },
          5000
        );

    }


    /* ======================================================
       OPEN POPUP
    ====================================================== */

    function openPopup() {

      checkUnlockExpiry();


      if (state.isUnlocked) {

        return;

      }


      updateUI();


      popupOverlay.classList.add(
        'active'
      );


      document.body.style.overflow =
        'hidden';

    }


    /* ======================================================
       CLOSE POPUP
    ====================================================== */

    function closePopup() {

      popupOverlay.classList.remove(
        'active'
      );


      document.body.style.overflow =
        '';


      checkAdCompletion();

    }


    /* ======================================================
       START AD
    ====================================================== */

    function startAdView() {

      checkUnlockExpiry();


      if (state.isUnlocked) {

        return;

      }


      if (
        state.completedAds >=
        CONFIG.totalAds
      ) {

        unlockVideo();

        return;

      }


      if (state.isAdPending) {

        showMessage(
          'An advertisement is already active. Please return after waiting.',
          'error'
        );

        return;

      }


      const link =
        CONFIG.adLinks[
          state.completedAds
        ];


      if (!link) {

        showMessage(
          'Advertisement link is not configured.',
          'error'
        );

        return;

      }


      state.adStartTime =
        Date.now();


      state.isAdPending =
        true;


      saveState();

      updateUI();


      const adWindow =
        window.open(
          link,
          '_blank'
        );


      if (!adWindow) {

        state.isAdPending =
          false;

        state.adStartTime =
          null;

        saveState();

        updateUI();


        showMessage(
          'Advertisement could not be opened. Please allow popups.',
          'error'
        );

      }

    }


    /* ======================================================
       CHECK AD
    ====================================================== */

    function checkAdCompletion() {

      if (
        !state.isAdPending ||
        state.isUnlocked
      ) {

        return;

      }


      if (!state.adStartTime) {

        state.isAdPending =
          false;

        saveState();

        updateUI();

        return;

      }


      const elapsed =
        Date.now() -
        state.adStartTime;


      if (
        elapsed >=
        CONFIG.requiredTimeMs
      ) {

        state.completedAds++;

        state.isAdPending =
          false;

        state.adStartTime =
          null;


        saveState();


        if (
          state.completedAds >=
          CONFIG.totalAds
        ) {

          unlockVideo();

        }

        else {

          const left =
            CONFIG.totalAds -
            state.completedAds;


          showMessage(
            'Advertisement completed. ' +
            left +
            ' more remaining.',
            'success'
          );


          updateUI();

        }

      }

      else {

        const seconds =
          Math.floor(
            elapsed / 1000
          );


        const requiredSeconds =
          Math.ceil(
            CONFIG.requiredTimeMs /
            1000
          );


        showMessage(
          'Please wait ' +
          Math.max(
            0,
            requiredSeconds -
            seconds
          ) +
          ' more seconds.',
          'error'
        );


        state.isAdPending =
          false;

        state.adStartTime =
          null;


        saveState();

        updateUI();

      }

    }


    /* ======================================================
       UNLOCK VIDEO
    ====================================================== */

    function unlockVideo() {

      state.isUnlocked =
        true;

      state.isAdPending =
        false;

      state.adStartTime =
        null;

      state.completedAds =
        CONFIG.totalAds;

      state.unlockTime =
        Date.now();


      saveState();

      updateUI();


      popupOverlay.classList.remove(
        'active'
      );


      document.body.style.overflow =
        '';


      unlockOverlay.classList.add(
        'hidden'
      );


      console.log(
        'Video unlocked:',
        POST_ID
      );

    }


    /* ======================================================
       EVENTS
    ====================================================== */

    unlockBtn.addEventListener(
      'click',
      openPopup
    );


    popupAdBtn.addEventListener(
      'click',
      startAdView
    );


    popupClose.addEventListener(
      'click',
      closePopup
    );


    /* ======================================================
       OUTSIDE CLICK
    ====================================================== */

    popupOverlay.addEventListener(
      'click',
      function (e) {

        if (
          e.target ===
          popupOverlay
        ) {

          closePopup();

        }

      }
    );


    /* ======================================================
       ESC KEY
    ====================================================== */

    document.addEventListener(
      'keydown',
      function (e) {

        if (
          e.key === 'Escape' &&
          popupOverlay.classList.contains(
            'active'
          )
        ) {

          closePopup();

        }

      }
    );


    /* ======================================================
       VISIBILITY
    ====================================================== */

    document.addEventListener(
      'visibilitychange',
      function () {

        if (
          document.visibilityState ===
          'visible'
        ) {

          checkUnlockExpiry();

          checkAdCompletion();

          updateUI();

        }

      }
    );


    /* ======================================================
       WINDOW FOCUS
    ====================================================== */

    window.addEventListener(
      'focus',
      function () {

        checkUnlockExpiry();

        checkAdCompletion();

        updateUI();

      }
    );


    /* ======================================================
       EXPIRY CHECK
    ====================================================== */

    setInterval(
      function () {

        checkUnlockExpiry();

      },
      1000
    );


    /* ======================================================
       RESET THIS VIDEO
       
       Console:
       resetThisVideoUnlock()
    ====================================================== */

    function resetThisVideoUnlock() {

      localStorage.removeItem(
        STORAGE.completed
      );

      localStorage.removeItem(
        STORAGE.status
      );

      localStorage.removeItem(
        STORAGE.pending
      );

      localStorage.removeItem(
        STORAGE.startTime
      );

      localStorage.removeItem(
        STORAGE.unlockTime
      );


      resetState();

      location.reload();

    }


    window.resetThisVideoUnlock =
      resetThisVideoUnlock;


    /* ======================================================
       INITIALIZE
    ====================================================== */

    if (
      state.completedAds >
      CONFIG.totalAds
    ) {

      state.completedAds =
        CONFIG.totalAds;

      saveState();

    }


    checkUnlockExpiry();

    updateUI();


    console.log(
      'Modern Video Unlock Loaded:',
      POST_ID
    );

  });

})();
