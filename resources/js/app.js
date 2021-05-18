
import axios from 'axios';

import Noty from 'noty';

import moment from 'moment';

import { initAdmin } from '../js/admin'

let addToCart = document.querySelectorAll('.add-to-cart');

addToCart.forEach((btn) => {

    let cartCounter = document.querySelector("#cartCounter");

    console.log(btn);

    function updateCart(pizza) {
        axios.post('/update-cart', pizza).then((res) => {
            console.log(res);

            cartCounter.innerText = res.data.totalQty

            new Noty({
                text: "Item added to cart",
                timeout: 1000,
                type: "success",
                progressBar: false,
                layout: "bottomCenter"
            }).show();

        }).catch(err => {



            new Noty({
                text: "Something went wrong",
                timeout: 1000,
                type: "error",
                progressBar: false,
                layout: "bottomCenter"
            }).show();
        })
    }

    btn.addEventListener('click', (e) => {

        let pizza = JSON.parse(btn.dataset.pizza)

        updateCart(pizza);
        // console.log(pizza);
    })

})


// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}



//change order status

let statuses = document.querySelectorAll('.status_line')

console.log(statuses);

//fetching the order object via input field
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? document.querySelector('#hiddenInput').value : null

order = JSON.parse(order)

let time = document.createElement('small')

//console.log(order);

function updateStatus(order) {

//foreach for removing the previous added class after 1 iteration when io performs

statuses.forEach((status)=>{
    status.classList.remove('step-completed')
    status.classList.remove('current')
})

    let stepCompleted = true;

    statuses.forEach((status) => { 

        let dataProp = status.dataset.status

        if(stepCompleted){
            status.classList.add('step-completed')
        }

        if(dataProp === order.status)
        {
             stepCompleted = false;
             time.innerText = moment(order.updatedAt).format('hh:mm A')
             status.appendChild(time)
            if(status.nextElementSibling)
            {
            status.nextElementSibling.classList.add('current')
            }
        }
    })
}

updateStatus(order);

//socket 

let socket = io()



//join 
if(order)
{
socket.emit('join',`order_${order._id}`) // this is sending req to server for connect socket with room with unique id Which is in 2 aurgument of emit method

}

let adminAreaPath = window.location.pathname

if(adminAreaPath.includes('admin'))
{
    initAdmin(socket)
    socket.emit('join','adminRoom')   //here socket  room name is adminRoom
}


socket.on('orderUpdated',(data)=>{
    const updatedOrder = {...order} //this right side expression is used to copy a object to another syntex {...objectName}

    updatedOrder.updatedAt = moment().format() //stroring current time
    updatedOrder.status =data.status
    updateStatus(updatedOrder)

    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
})


