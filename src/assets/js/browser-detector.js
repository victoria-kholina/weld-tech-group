document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('browser-warning-window');
    var closeBtn = document.getElementById('browser-warning-close');
    var userDismissedWarning = localStorage.getItem('browserWarningDismissed') === 'true';
    
    var isIE = /MSIE|Trident/.test(navigator.userAgent);
    
    if (isIE && !userDismissedWarning) {
        modal.style.display = 'block';
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'none';
            }
            localStorage.setItem('browserWarningDismissed', 'true');
        });
    }
});
  

  