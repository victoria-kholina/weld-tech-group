document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('browser-warning-window');
    var closeBtn = document.getElementById('browser-warning-close');
    var userDismissedWarning = localStorage.getItem('browserWarningDismissed') === 'true';
    
    // Проверяем, является ли браузер IE
    var isIE = /MSIE|Trident/.test(navigator.userAgent);
    
    // Если это IE и пользователь еще не закрывал предупреждение
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
  

  