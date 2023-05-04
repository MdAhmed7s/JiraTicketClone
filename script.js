// Selecting ADD Button
let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textAreaCont = document.querySelector(".textarea-cont");
let allPriorityColor = document.querySelectorAll(".priority-color");

let toolBoxColors = document.querySelectorAll(".color");

// Filtering The Tickets Based On Colors Selections ....

let ticketsArr =[]; //An Empty Array for storing tickets objects

// Checking First Before Creating Any Extra Tickets
// Local-Starage 
  // Data == True -->> Retrieve & Display
  // Data == False -->> Nothing To Display

if(localStorage.getItem("jira_tickets")){
  ticketsArr=JSON.parse(localStorage.getItem("jira_tickets"));
  ticketsArr.forEach((ticketObj)=>{
    createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
  })
}




for(let i=0; i<toolBoxColors.length;i++)
{
  toolBoxColors[i].addEventListener("click", (e) =>{
    let currentToolBoxColor = toolBoxColors[i].classList[0];

    // Applying direct function of Array for filtering 
    let filteredTickets = ticketsArr.filter((ticketObj, idx) =>{
      return currentToolBoxColor === ticketObj.ticketColor;
    })
    // Now we have to first remove all the previous tickets then show only the selected tickets after filtering
    let allTicketsCont = document.querySelectorAll(".ticket-cont");
    for(let i=0;i<allTicketsCont.length;i++)
    {
      allTicketsCont[i].remove();
    }

    //Now we display all the filetered tickets
    filteredTickets.forEach((ticketObj, idx) =>{
      createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
    })
  })
  // On double clicking on any colors display all the tickets that we have generated
  toolBoxColors[i].addEventListener("dblclick", (e) =>{
    // Removing previous tickets
    let allTicketsCont = document.querySelectorAll(".ticket-cont");
    for(let i=0;i<allTicketsCont.length;i++)
    {
      allTicketsCont[i].remove();
    }

    // Displaying all the tickets using the ticketArr that we created to store the objects
    ticketsArr.forEach((ticketObj, idx)=>{
    createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
  })
})
}

let lockEle = document.querySelector(".ticket-lock");

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

// fixing our default color
let colors = ["lightpink", "lightgreen", "lightblue", "black"];
let modalPriorityColor = colors[colors.length-1];

// Listener for modal priority color which we will be using to write our task
allPriorityColor.forEach((colorEle, idx) =>{
  colorEle.addEventListener("click", (e) => {
    // let us first remove the border from the colors 
    allPriorityColor.forEach((priorityColorEle, idx) =>{
      priorityColorEle.classList.remove("border");
    })
    colorEle.classList.add("border");
    modalPriorityColor = colorEle.classList[0];
  })
})

// Adding and Event Listene  ADD Button
addBtn.addEventListener("click", (e)=>{
  // Creating Display Modal
  // Generating Ticket

  // addFlag = true -> Display Modal
  // addFlag = false -> Dont Display Modal ("None")
  // Keep Toggling the addFlag ( !addFlag -> true raha to false hota &&&& false raha to true hota)
  addFlag = !addFlag;
  
  if(addFlag)
  {
    modalCont.style.display = "flex";
  }
  else
  {
    modalCont.style.display = "none"; 
  }
})


removeBtn.addEventListener("click", (e) =>{
  removeFlag = !removeFlag;
})

// Putting add event listener so that when ctr + enter is pressed it creates the ticket

modalCont.addEventListener("keydown", (e)=>{
  let key = e.key;
  if(key === "Shift")
  {
    createTicket(modalPriorityColor, textAreaCont.value);
    addFlag=false;
    setModalToDefault();
  }
})

// Here we are writing a function that will generate tickets and put in the main container

function createTicket(ticketColor, ticketTask, ticketId){
  let id = ticketId || shortid();
  let ticketCont = document.createElement("div");
  ticketCont.setAttribute("class", "ticket-cont");
  ticketCont.innerHTML = `
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id
    }</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock">
      <i class="fa-solid fa-lock">
      </i>
    </div>
    `;
    mainCont.appendChild(ticketCont);

    //Create object of ticket and add to array for future use 
    if(!ticketId)
    {
      ticketsArr.push({ticketColor, ticketTask, ticketId:id});
      localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    }
    console.log(ticketsArr);
    handleRemove(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);
}

// Function for toggling the x button
function handleRemove(ticket, id){
  // removeFlag = true --> Remove
  ticket.addEventListener("click", (e)=>{
    if(!removeFlag)
    {
      return;
    }
    //Database Removal
    let idx = getTicketIdx(id);
    ticketsArr.splice(idx, 1);
    let strTicket = JSON.stringify(ticketsArr);
    localStorage.setItem("jira_tickets", strTicket);
    
    ticket.remove(); //UI Removal
    
  }) 
}

// Function for accessing the lock and performing our required operations that is locing and unlocking
function handleLock(ticket, id){
  let ticketLockEle = ticket.querySelector(".ticket-lock");
  let ticketLock = ticketLockEle.children[0];
  let ticketTaskArea = ticket.querySelector(".task-area");
  ticketLock.addEventListener("click", (e)=>{
    let ticketIdx = getTicketIdx(id);

    if(ticketLock.classList.contains(lockClass))
    {
      ticketLock.classList.remove(lockClass);
      ticketLock.classList.add(unlockClass);
      ticketTaskArea.setAttribute("contenteditable", "true");
    }
    else
    {
      ticketLock.classList.remove(unlockClass);
      ticketLock.classList.add(lockClass);
      ticketTaskArea.setAttribute("contenteditable", "false");
    }
    //Modify data in Local-Storage (Ticket Task)
    ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
    localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));

  });
}

// Funtion for handling the color of tickets 
function handleColor(ticket, id){
  let ticketColor = ticket.querySelector(".ticket-color");
  ticketColor.addEventListener("click", (e)=>{
    // get ticket index from the tickets array
    let ticketIdx = getTicketIdx(id);
  let currentTicketColor = ticketColor.classList[1];
    let currentTicketColorIdx = colors.findIndex((color)=>{
      return currentTicketColor===color;
    });
  currentTicketColorIdx++;
  let newTicketColorIdx = currentTicketColorIdx % colors.length;
  let newTicketColor = colors[newTicketColorIdx];
  ticketColor.classList.remove(currentTicketColor);
  ticketColor.classList.add(newTicketColor);

  // Modify data in Local-Stroage (Priority Color Changed)
  ticketsArr[ticketIdx].ticketColor=newTicketColor;
  localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
})
}

function getTicketIdx(id){
  let ticketIdx=ticketsArr.findIndex((ticketObj)=>{
    return ticketObj.ticketId===id;
  })
  return ticketIdx;
}

// Default function for setting values to default after our work is done 
function setModalToDefault() {
  modalCont.style.display="none";
    textAreaCont.value="";
    modalPriorityColor=colors[colors.length-1];
  allPriorityColor.forEach((priorityColorEle, idx) =>{
    priorityColorEle.classList.remove("border");
  })
  allPriorityColor[allPriorityColor.length-1].classList.add("border");
}