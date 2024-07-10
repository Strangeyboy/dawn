/* document.addEventListener('DOMContentLoaded', function () {
    // Set the start date when the page is loaded
    var startDate = new Date().getTime();
  
    // Update the timer every 10 milliseconds
    var timerFunction = setInterval(function () {
      // Get the current time
      var now = new Date().getTime();
  
      // Find the time difference between now and the start date
      var distance = now - startDate;
  
      // Time calculations for hours, minutes, seconds, and millisecondsx
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      //var milliseconds = distance % 1000;
  
      // Format time as 00.00.00.00
      var formattedHours = hours.toString().padStart(2, '0');
      var formattedMinutes = minutes.toString().padStart(2, '0');
      var formattedSeconds = seconds.toString().padStart(2, '0');
      //var formattedMilliseconds = milliseconds.toString().padStart(3, '0').slice(0, 2); // Ensure milliseconds have 2 decimals
  
      var formattedTime = `${formattedHours}.${formattedMinutes}.${formattedSeconds}`;
  
      // Display the result in the corresponding element
      document.getElementById('formatted-time').innerText = formattedTime;
    }, 10);
  }); */