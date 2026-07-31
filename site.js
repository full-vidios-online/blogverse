(function () {

  'use strict';


  /* ========================================================
     CONFIGURATION
  ======================================================== */

  const CONFIG = {

    totalAds: 3,

  requiredTimeMs:
  5 * 1000,

    unlockDurationMs:
      60 * 60 * 1000,

    adLinks: [

      "https://example.com/link1",

      "https://example.com/link2",

      "https://example.com/link3"

    ]

  };


  /* ========================================================
     DOM
  ======================================================== */

  const unlockOverlay =
    document.getElementById('unlockOverlay');

  const unlockBtn =
    document.getElementById('unlockBtn');

  const popupOverlay =
    document.getElementById('unlockPopup');

  const popupTotal =
    document.getElementById('popupTotal');

  const popupCompleted =
    document.getElementById('popupCompleted');

  const popupRemaining =
    document.getElementById('popupRemaining');

  const popupAdBtn =
    document.getElementById('popupAdBtn');

  const popupBtnText =
    document.getElementById('popupBtnText');

  const popupError =
    document.getElementById('popupError');

  const popupErrorText =
    document.getElementById('popupErrorText');

  const popupMessageIcon =
    document.getElementById('popupMessageIcon');

  const progressFill =
    document.getElementById('progressFill');


  /* ========================================================
     STATE
  ======================================================== */

  let state = {

    completedAds:
      parseInt(
        localStorage.getItem(
          'unlock_completed'
        )
      ) || 0,

    isUnlocked:
      localStorage.getItem(
        'unlock_status'
      ) === 'true',

    isAdPending:
      localStorage.getItem(
        'unlock_pending'
      ) === 'true',

    adStartTime:
      parseInt(
        localStorage.getItem(
          'unlock_start_time'
        )
      ) || null,

    unlockTime:
      parseInt(
        localStorage.getItem(
          'unlock_time'
        )
      ) || null

  };


  /* ========================================================
     SAVE
  ======================================================== */

  function saveState() {

    localStorage.setItem(
      'unlock_completed',
      state.completedAds
    );

    localStorage.setItem(
      'unlock_status',
      state.isUnlocked
    );

    localStorage.setItem(
      'unlock_pending',
      state.isAdPending
    );

    localStorage.setItem(
      'unlock_start_time',
      state.adStartTime || ''
    );

    localStorage.setItem(
      'unlock_time',
      state.unlockTime || ''
    );

  }


  /* ========================================================
     EXPIRY
  ======================================================== */

  function checkUnlockExpiry() {

    if (!state.isUnlocked)
      return;


    if (!state.unlockTime) {

      lockVideo();

      return;

    }


    const elapsed =
      Date.now() -
      state.unlockTime;


    if (
      elapsed >=
      CONFIG.unlockDurationMs
    ) {

      lockVideo();

      showMessage(
        '১ ঘণ্টার ভিডিও অ্যাক্সেস শেষ হয়েছে। আবার আনলক করুন।',
        'error'
      );

    }

  }


  /* ========================================================
     LOCK VIDEO
  ======================================================== */

  function lockVideo() {

    state.isUnlocked = false;

    state.completedAds = 0;

    state.isAdPending = false;

    state.adStartTime = null;

    state.unlockTime = null;

    saveState();

    updateUI();

  }


  /* ========================================================
     UPDATE UI
  ======================================================== */

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


    popupTotal.textContent =
      CONFIG.totalAds;

    popupCompleted.textContent =
      state.completedAds;

    popupRemaining.textContent =
      remaining;


    /* VIDEO */

    if (state.isUnlocked) {

      unlockOverlay.classList.add(
        'hidden'
      );

      unlockBtn.disabled = true;

      unlockBtn.innerHTML =
        '<i class="fa-solid fa-circle-check"></i>' +
        '<span>ভিডিও আনলক করা হয়েছে</span>';

    }

    else {

      unlockOverlay.classList.remove(
        'hidden'
      );

      unlockBtn.disabled = false;

      unlockBtn.innerHTML =
        '<i class="fa-solid fa-unlock-keyhole"></i>' +
        '<span>ভিডিও আনলক করুন</span>';

    }


    /* AD BUTTON */

    if (remaining <= 0) {

      popupBtnText.textContent =
        'সব ধাপ সম্পন্ন হয়েছে';

      popupAdBtn.disabled = true;

      return;

    }


    if (state.isAdPending) {

      popupBtnText.textContent =
        'বিজ্ঞাপন থেকে ফিরে আসুন...';

      popupAdBtn.disabled = true;

    }

    else {

      popupBtnText.textContent =
        `বিজ্ঞাপন দেখুন (${remaining} বাকি)`;

      popupAdBtn.disabled = false;

    }

  }


  /* ========================================================
     OPEN POPUP
  ======================================================== */

  window.openUnlockPopup =
    function () {

      checkUnlockExpiry();

      if (state.isUnlocked) {

        updateUI();

        return;

      }

      updateUI();

      popupOverlay.classList.add(
        'active'
      );

      document.body.style.overflow =
        'hidden';

    };


  /* ========================================================
     CLOSE POPUP
  ======================================================== */

  window.closeUnlockPopup =
    function () {

      popupOverlay.classList.remove(
        'active'
      );

      document.body.style.overflow =
        '';

      checkAdCompletion();

    };


  /* ========================================================
     START AD
  ======================================================== */

  window.startAdView =
    function () {

      checkUnlockExpiry();

      if (state.isUnlocked)
        return;


      if (
        state.completedAds >=
        CONFIG.totalAds
      ) {

        unlockVideo();

        return;

      }


      if (state.isAdPending) {

        showMessage(
          'আপনি ইতিমধ্যে একটি বিজ্ঞাপন ভিজিট করছেন। ফিরে এসে অপেক্ষা করুন।',
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
          'Advertisement link পাওয়া যায়নি।',
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


      /*
        নতুন tab
      */

      const adWindow =
        window.open(
          link,
          '_blank'
        );


      /*
        Popup blocker
      */

      if (!adWindow) {

        state.isAdPending =
          false;

        state.adStartTime =
          null;

        saveState();

        updateUI();

        showMessage(
          'ব্রাউজার popup বন্ধ করে দিয়েছে। অনুগ্রহ করে popup অনুমতি দিন।',
          'error'
        );

        return;

      }


      /*
        Maximum pending time
      */

      setTimeout(
        function () {

          if (!state.isAdPending)
            return;


          const elapsed =
            Date.now() -
            state.adStartTime;


          if (
            elapsed >=
            5 * 60 * 1000
          ) {

            state.isAdPending =
              false;

            state.adStartTime =
              null;

            saveState();

            updateUI();

            showMessage(
              'অনেকক্ষণ ধরে ফিরে আসেননি। আবার চেষ্টা করুন।',
              'error'
            );

          }

        },
        5 * 60 * 1000
      );

    };


  /* ========================================================
     CHECK AD
  ======================================================== */

  function checkAdCompletion() {

    if (
      !state.isAdPending ||
      state.isUnlocked
    )
      return;


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

        showMessage(
          `সফল! আরও ${
            CONFIG.totalAds -
            state.completedAds
          }টি ধাপ বাকি।`,
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


      showMessage(
        `মাত্র ${seconds} সেকেন্ড হয়েছে। আরও ${
          (CONFIG.requiredTimeMs -
          elapsed) / 1000
        } সেকেন্ড অপেক্ষা করুন।`,
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


  /* ========================================================
     UNLOCK
  ======================================================== */

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


    showMessage(
      'ভিডিও সফলভাবে ১ ঘণ্টার জন্য আনলক হয়েছে।',
      'success'
    );

  }


  /* ========================================================
     MESSAGE
  ======================================================== */

  function showMessage(
    message,
    type = 'error'
  ) {

    popupErrorText.textContent =
      message;

    popupError.style.display =
      'flex';


    if (type === 'success') {

      popupError.style.color =
        '#047857';

      popupError.style.background =
        '#ecfdf5';

      popupError.style.borderColor =
        '#a7f3d0';

      popupMessageIcon.className =
        'fa-solid fa-circle-check';

    }

    else {

      popupError.style.color =
        '#b91c1c';

      popupError.style.background =
        '#fef2f2';

      popupError.style.borderColor =
        '#fecaca';

      popupMessageIcon.className =
        'fa-solid fa-circle-info';

    }


    clearTimeout(
      window.unlockMessageTimer
    );


    window.unlockMessageTimer =
      setTimeout(
        function () {

          popupError.style.display =
            'none';

        },
        5000
      );

  }


  /* ========================================================
     OUTSIDE CLICK
  ======================================================== */

  popupOverlay.addEventListener(
    'click',
    function (e) {

      if (
        e.target ===
        popupOverlay
      ) {

        closeUnlockPopup();

      }

    }
  );


  /* ========================================================
     VISIBILITY
  ======================================================== */

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


  /* ========================================================
     WINDOW FOCUS
  ======================================================== */

  window.addEventListener(
    'focus',
    function () {

      checkUnlockExpiry();

      checkAdCompletion();

      updateUI();

    }
  );


  /* ========================================================
     EXPIRY CHECK
  ======================================================== */

  setInterval(
    function () {

      checkUnlockExpiry();

    },
    1000
  );


  /* ========================================================
     INITIALIZE
  ======================================================== */

  function initialize() {

    if (
      state.completedAds >
      CONFIG.totalAds
    ) {

      state.completedAds =
        CONFIG.totalAds;

    }


    checkUnlockExpiry();

    updateUI();

  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      initialize
    );

  }

  else {

    initialize();

  }


  /* ========================================================
     RESET
     Console:
     resetUnlockSystem()
  ======================================================== */

  window.resetUnlockSystem =
    function () {

      localStorage.removeItem(
        'unlock_completed'
      );

      localStorage.removeItem(
        'unlock_status'
      );

      localStorage.removeItem(
        'unlock_pending'
      );

      localStorage.removeItem(
        'unlock_start_time'
      );

      localStorage.removeItem(
        'unlock_time'
      );

      location.reload();

    };

})();
