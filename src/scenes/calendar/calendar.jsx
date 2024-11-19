import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import axios from "axios";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/event/events")
      .then((response) => {
        console.log("Fetched events:", response.data);
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, []);

  // Add event
  const handleDateClick = (selected) => {
    const title = prompt("Enter event title");
    if (title) {
      const newEvent = {
        id: `${Date.now()}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      };

      axios
        .post("http://localhost:3000/event/events", newEvent)
        .then((response) => {
          setEvents([...events, response.data]);
        })
        .catch((error) => console.error("Error adding event:", error));
    }
  };

  // Delete event
  const handleEventClick = (selected) => {
    console.log("Selected event:", selected.event);
    console.log("Event ID:", selected.event.id);

    if (!selected.event.id) {
      console.error("Event ID is missing! Cannot delete the event.");
      return;
    }

    if (window.confirm(`Do you want to delete '${selected.event.title}'?`)) {
      const eventId = selected.event.id;

      axios
        .delete(`http://localhost:3000/event/events/${eventId}`)
        .then(() => {
          setEvents(events.filter((event) => event.id !== eventId));
        })
        .catch((error) => console.error("Error deleting event:", error));
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        Theo dõi lịch trình
      </Typography>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        }}
        locale="vi"
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={events}
        select={handleDateClick}
        eventClick={handleEventClick}
      />
    </Box>
  );
};

export default Calendar;
