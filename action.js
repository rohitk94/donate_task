(function () {
    let tdata = [], _d = null, index = 0, maxWeight = 22679.6;  // 50 lbs into grams
    let errorElement = document.getElementById("alertMessage");

    /**
     * Get book enquiry details
     */
    document.getElementById("bookEnquiry").addEventListener("click", async (e) => {
        e.preventDefault();
        let isbn = document.getElementById("isbnsearch").value;
        if (!isbn) {
            showMessage(1, 'ISBN is required!');
        }

        let data = await fetch("https://api.palletiq.com/v1/isbn/" + isbn + "/0?token=OLcchl0kP80bxfTcLbYVKx4Br4Rt9Wda");
        data = await data.json();

        if (data.status !== 'failed') {
            document.getElementById("isbnsearch").value = '';

            let sum = sumData(tdata);
            if((parseFloat(sum) + data.meta.weight) >= maxWeight) {
                showMessage(2, 'You reached maximum books for donation - click the Proceed button for shipping process. If you have more books, you may start over the process after the labels are created.');
                return;
            }
            index++;
            showMessage(0, 'Yes this book eligible to donate. Click Next to add to the item list.');

            tdata.push({
                index,
                image: data.meta.image_url,
                title: data.meta.title,
                asin: data.meta.asin,
                weight: data.meta.weight,
                fbaDecison: data.winner.amazonLogData.fba_decision ? "Yes" : "No"
            });

            _d = tdata[tdata.length - 1];
        }
        else {
            showMessage(1, 'We are sorry, this book is not eligible for donation, kindly, check another!');
        }
    });

    /**
     * Next enquiry data added in table
     */
    document.getElementById("nextEnquiry").addEventListener("click", async (e) => {
        e.preventDefault();
        document.getElementById('display').style.display = 'none';
        if (_d) {
            let keys = Object.keys(_d), tds = "", id = "delete_" + index;
            for (let index = 0; index < keys.length; index++) {
                if (keys[index] === "image") {
                    tds += `<td><img src=${_d[keys[index]]} alt=""></td>`
                } else
                    tds += `<td>${_d[keys[index]]}</td>`;
            }
            let tr = document.createElement('tr');
            tr.id = "tr_" + index;

            let button = `<button id=${id}>Delete</button>`;
            tr.innerHTML = `${tds}<td>${button}</td>`;

            let tbody = document.getElementById("tbody");
            document.getElementById("table").style.display = "block";
            tbody.appendChild(tr);
            _d = null;

            /** Sum of data **/
            let sum = sumData(tdata);
            document.getElementById("sum").innerHTML = sum;

            /**
             * Delete data from table
             */
            document.getElementById(id).addEventListener("click", async (e) => {
                let id = e.target.id;
                index = id.split("_")[1];
                document.getElementById("tr_" + index).remove();
                console.log((Number(index) - 1))
                console.log((Number(index)))
                tdata.splice((Number(index) - 1), 1);

                index = tdata.length;
                let tb = document.getElementById("tbody");

                if (!index) {
                    document.getElementById("table").style.display = "none";
                }

                /** Refresh id and index **/
                for (let index = 0; index < tb.childNodes.length; index++) {
                    tb.childNodes[index].id = "tr_" + (index + 1);
                    tb.childNodes[index].firstChild.innerHTML = (index + 1);
                    tb.childNodes[index].lastChild.firstChild.id = "delete_" + (index + 1);
                }
                let sum = sumData(tdata);
                document.getElementById("sum").innerHTML = sum;
            })
        } else {
            showMessage(0, 'No enquiry found!');
        }
    });


    /**
     * start Over button
     */
    document.getElementById("startOver").addEventListener("click", async (e) => {
        e.preventDefault();

        let tbody = document.getElementById("tbody");
        tbody.innerHTML = '';
        tdata = [];
        index = 0;
        document.getElementById("table").style.display = "none";
        let sum = sumData(tdata);
        document.getElementById("sum").innerHTML = sum;
    });

    /**
     * Sum data
     * @param tdata
     * @returns {number}
     */
    function sumData(tdata) {
        let sum = 0;
        for (let value of tdata) {
            sum = sum + value.weight;
        }
        return sum.toFixed(2)
    }

    /**
     * Show error messsage
     * @param error
     * @param message
     */
    function showMessage (error, message) {
        errorElement.innerHTML = message;
        document.getElementById('display').style.display = 'flex';
        let background = "green";
        if(error === 1) {
            background = "red";
        }
        if(error === 2) {
            background = "orange";
        }
        document.getElementById('display').style["background-color"] = background;
    }

})();
