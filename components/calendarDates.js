import dayjs from "dayjs";

export const dateGenerator = (
    month = dayjs().month(), 
    year = dayjs().year()
) =>{
    const firstDateOfMonth = dayjs().year(year).month(month).startOf("month");
    const lastDateOfMonth = dayjs().year(year).month(month).endOf("month");

    const arrayOfDates = []

    // previous month

    for(let i=0;i < firstDateOfMonth.day();i++){
        arrayOfDates.push({
            date: firstDateOfMonth.day(i),
            currentMonth: false
        });
    }


    // current month
    for(let i = firstDateOfMonth.date();i<=lastDateOfMonth.date();i++){
        arrayOfDates.push({
            date:firstDateOfMonth.date(i),
            currentMonth: true,
            today: firstDateOfMonth.date(i).toDate().toDateString() === dayjs().toDate().toDateString()
             
        })
    }

    // upcoming month
    const remaining = 42 - arrayOfDates.length //remaining days to be filled out within 6x7 calendar format

    for(let i = lastDateOfMonth.date()+1;i<=lastDateOfMonth.date()+remaining;i++)
        arrayOfDates.push({
            date:lastDateOfMonth.date(i),
            currentMonth: false,

    })

    return arrayOfDates;
}

export const months = [
    "January",
    "Febrary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]