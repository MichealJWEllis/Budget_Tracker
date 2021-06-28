

let db;
const request = indexedDB.open('budget_tracker', 1)

request.onupgradeneeded = function (event) {
    const db = event.target.result
    db.createObjectStore('new_budget', { autoIncrement: true })
}

// on a success
request.onsuccess = function (event) {
    db = event.target.result

    if (navigator.onLine) {
        queryDb()
    }
}

request.onerror = function (event) {
    console.log("😤 " + event.target.errorCode)
}

// function that will fire if an attempt to submit a new budget and the internet connetion is not applied
function saveRecord(record) {
    const transaction = db.transaction(["new_budget"], "readwrite")
    const budgetStore = transaction.objectStore('new_budget')
    budgetStore.add(record)
}

function queryDb() {
    const transaction = db.transaction(['new_budget'], 'readwrite')
    const budgetStore = transaction.objectStore('new_budget')
    const getEm = budgetStore.getEm()

    getEm.onsuccess = function () {
        if (getEm.result.length > 0) {
            fetch('api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getEm.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse)
                    }
                    const transaction = db.transaction(['new_budget'], 'readwrite')
                    const budgetStore = transaction.objectStore('new_budget')
                    budgetStore.clear()
                })
                .catch(e => {
                    console.log(e)
                })
        }
    }
}

window.addEventListener('online', queryDb)