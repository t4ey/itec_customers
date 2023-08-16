document.addEventListener('DOMContentLoaded', function () {
    const inputDateStart = document.getElementById('date_l_start');
    const inputDateEnd = document.getElementById('date_l_end');

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().slice(0, 10);
    // const currentDate = ;
    // console.log(currentDate)

    // Set the input's value to the current date
    inputDateStart.value = currentDate;
    inputDateEnd.value = currentDate;
});