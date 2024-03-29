// Source https://stackoverflow.com/questions/4313841/insert-a-string-at-a-specific-index
function insertString(str, index, value) {
    return str.slice(0, index) + value + str.slice(index);
}

/*
    setMonth sets the displayed month of the calendar
    to the month of the given date
*/
function setMonth(day){
    var month = day.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

    document.getElementById("monthID").innerHTML = monthNames[month];
}

/*
    setYear sets the displayed year of the calendar
    to the year of the given date
*/
function setYear(day){
    var year = day.getFullYear();
    document.getElementById("yearID").innerHTML = year;
}

function getWeek(date){
    var firstWeekday = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    var offsetDate = date.getDate() + firstWeekday - 1;
    return Math.floor(offsetDate / 7);
}

/*
    Slice time converts the calendar begin and end times to 12 hour times and
    returns a string of the times
    Ex. 2:00PM-4:00PM
*/
function sliceTime(beginDate, endDate){

    let start = beginDate.slice(9,13);
    let end = endDate.slice(9,13);

    // if Splice does not get a number then it is an all day event.
    if(start == "" || end == ""){
        return "All day:";
    }

    var startTime = parseInt(start, 10);
    var endTime = parseInt(end, 10);

    var startSuffix = ((startTime >= 1200)? 'PM-' : 'AM-');
    var endSuffix = ((endTime >= 1200)? 'PM:' : 'AM:');

    startTime = (startTime >= 1300 ? startTime - 1200 + "" : startTime + "");
    endTime = (endTime >= 1300 ? endTime - 1200 + "" : endTime + "");


    var finalStartTime = (startTime >= 1000 ? insertString(startTime, 2, ":") + startSuffix : insertString(startTime, 1, ":") + startSuffix);
    var finalEndTime = (endTime >= 1000 ? insertString(endTime, 2, ":") + endSuffix : insertString(endTime, 1, ":") + endSuffix);

    return finalStartTime + finalEndTime;

}

// Maybe just use this and edit sliceTime to use this date format instead
// Would probably be much cleaner
function sliceDate(date){
    var year = date.slice(0,4);
    var month = date.slice(4,6) -1 ;
    var day = date.slice(6,8);
    var hour = date.slice(9,11);
    var minute = date.slice(11,13);
    var second = date.slice(13,15);

    return new Date(year, month, day, hour, minute, second);
}

/*
    Addevent takes as input an event object and inserts it onto the calendar"
*/
function addEvent(event){

    var today = new Date();
    if(event.beginDate.getMonth() !== today.getMonth()){
        return false;
    }

    var section = document.createElement("section");
    section.innerHTML = event.time + " " + event.description;
    var sectionClass = document.createAttribute("class");

    sectionClass.value = "task task--info";
    section.setAttributeNode(sectionClass);
    var sectionStyle = document.createAttribute("style");

    var weekOfMonth  = getWeek(event.beginDate);
    var weekOfMonthEnd = getWeek(event.finalDate);

    // Multi Week events
    if(weekOfMonth !== weekOfMonthEnd){


        // Because javascript passes objects by reference
        // we need to first change the start date to the upcoming sunday
        // then set it back to the original day
        // then set the final date to the upcoming saturday.
        var dayDiff = 6 - event.beginDate.getDay();

        event.beginDate.setDate(event.beginDate.getDate() + dayDiff + 1);

        addEvent(event);
        event.beginDate.setDate(event.beginDate.getDate() - dayDiff - 1);
        event.finalDate.setDate(event.beginDate.getDate() + dayDiff);

        addEvent(event);
        return true;
    }

    var day = event.beginDate.getDay();
    var lastDay = event.finalDate.getDay();

    var dayDifference = (lastDay - day) + 1;

    // Will need to change this to be adjustable based on event date
    sectionStyle.value = `grid-column:${day + 1} / span ${dayDifference}; grid-row:${weekOfMonth + 2};`;
    section.setAttributeNode(sectionStyle);
    document.getElementById("calendarLayout").appendChild(section);
}


/*
*   This function will read the current month and determine
*   how the days should be alligned.
*   i.e In what column/row cell should the first and last of the month be
*   as well as all the other days in between.
*   This should also set the empty cells before and after the first and last
*   of the month to the appropriate days of the previous and following month.
*   Example: The first of the month falls on a tuesday, the monday and sunday
*   cells should be the last 2 days of the previous month.
*/
function updateCalendarDays(day){
    const monthTotalDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var currentMonth = day.getMonth();
    var currentYear = day.getFullYear();

    var firstOfMonth = new Date(currentYear, currentMonth);
    var dayFirstOfMonth = firstOfMonth.getDay(); // Gets the day of the week

    // This will be the first x squares of the calendar (ie previous months months days)
    var lastOfPrevMonth =  new Date(currentYear, currentMonth - 1,
                                monthTotalDays[currentMonth - 1]);
    var dayLastOfPrevMonth =  lastOfPrevMonth.getDay(); // Gets the day of the
                                                       // week of the last day
                                                       // of the previous month
    var dayNum = 1;
    var prevMonthDayNum = monthTotalDays[currentMonth-1] - dayLastOfPrevMonth;
    var nextMonthDayNum = 1;

    for(var row = 0; row < 5; row++){
        for(var col = 0; col < 7; col++){

            // If we are before the start of the month then we take the last
            // months days and set to disabled
            if(col <= dayLastOfPrevMonth && row == 0 && dayFirstOfMonth !== 0){
                document.getElementById("" + row + " " + col).innerHTML = prevMonthDayNum;
                document.getElementById("" + row + " " + col).className = "day day--disabled"
                prevMonthDayNum++;

            }
            // The days of the current month
            else if(dayNum <= monthTotalDays[currentMonth]){
                document.getElementById("" + row + " " + col).innerHTML = dayNum;
                dayNum++;
            }
            // If we are after the start of the month then we take the next
            // months days and set to disabled
            else{
                document.getElementById("" + row + " " + col).innerHTML = nextMonthDayNum;
                document.getElementById("" + row + " " + col).className = "day day--disabled"
                nextMonthDayNum++;
            }

        }
    }
}



// Main Skeleton
/*
Wait Refresh time
Check Current Month & Year
    Update Calendar Appropriately

Open ICS file
    if(line == "begin VEVENT")
        while(line != "end VEVENT")
            analyzeLine(line, object(VEVENT)) // This will take in the line and
                                              // put the appropriate info into
                                              // the object.
            next line
        put object into vevent array

    go through vevent array and insert items into current months days

*/
function main(){
        var today = new Date();
        setMonth(today);
        setYear(today);
        updateCalendarDays(today);

        var len = 50;
        var count = 0;
        var lineReader = require('line-reader');

        /* while traversing file
            if find BEGIN:VEVENT
                create new event
                loop until find END:VEVENT
                    parse lines and convert date time etc
                    add info to event obj
                addevent()
        */
        document.getElementById('file').onchange = function(){

            var file = this.files[0];

            var reader = new FileReader();
            reader.onload = function(progressEvent){

                var lines = this.result.split('\n');
                for(var line = 0; line < lines.length; line++){
                    var lineS = lines[line].trim();
                    var beginEvent = "BEGIN:VEVENT";
                    if(lines[line].trim() == beginEvent){
                        let vevent = {
                            startDate: "",
                            endDate: "",
                            time: "", //This should just be converted from start/end date
                            description: "",
                            beginDate: "",
                            finalDate: ""
                        };
                        line++;
                        while(lines[line].trim() !== "END:VEVENT"){
                            var str = lines[line].trim();
                            if(str.includes("DTEND")){
                                console.log(str.slice(31));
                                vevent.endDate = str.slice(31);
                            }
                            else if(str.includes("DTSTART")){
                                console.log(str.slice(33));
                                vevent.startDate = str.slice(33);
                            }
                            else if(str.includes("SUMMARY")){
                                console.log(str.slice(8));
                                vevent.description = str.slice(8);
                            }
                            line++;
                        }
                        vevent.time = sliceTime(vevent.startDate, vevent.endDate)
                        vevent.beginDate = sliceDate(vevent.startDate);
                        vevent.finalDate = sliceDate(vevent.endDate);
                        addEvent(vevent);
                    }

            }
          };
          reader.readAsText(file);
        };
}


// if day == sunday and length > 1
// recreate event with new startDate

/*
if startDay > endDay
add first event with correct start day
make duplicate new event with new start day and add event

do getWeek if weeks are different then startday span 7
0 span endDay

*/

// TODO: Repeat events
//       Events that go into the next week.
