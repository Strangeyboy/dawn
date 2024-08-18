document.addEventListener('DOMContentLoaded', function () {
  if (document.body.classList.contains('page-about76')) {
      // Set the start date when the page is loaded
      var startDate = new Date().getTime();
      
      // Function to update the SVG image

      function updateBackground(formattedTime) {
        document.getElementById('svg-timer').textContent = formattedTime;
      }

      // Update the timer every 10 milliseconds
      var timerFunction = setInterval(function () {
          // Get the current time
          var now = new Date().getTime();

          // Find the time difference between now and the start date
          var distance = now - startDate;

          // Time calculations for minutes, seconds, and milliseconds
          var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          var seconds = Math.floor((distance % (1000 * 60)) / 1000);
          var milliseconds = distance % 1000;

          // Format time as 00.00.00.00
          var formattedMinutes = minutes.toString().padStart(2, '0');
          var formattedSeconds = seconds.toString().padStart(2, '0');
          var formattedMilliseconds = milliseconds.toString().padStart(3, '0').slice(0, 2); // Ensure milliseconds have 2 decimals

          var formattedTime = `${formattedMinutes}.${formattedSeconds}.${formattedMilliseconds}`;

          // Update the background with the new time
          updateBackground(formattedTime);
      }, 10);
  }
});