import SAVED from "./saved.js";
import SEARCH from "./search.js";

const APP = {
    key: "drink",
    searchInput: document.querySelector("#search-input"),
    drinksList: document.querySelector("#drinks-list"),
    drinks: [],

    init: () => {
        console.log("App initialized.");
        
        APP.drinks = SAVED.getLocalStorage(APP.drinks);
        APP.eventListeners();
    },

    eventListeners: () => {
        let searchBtn = document.querySelector("#search-btn");
        searchBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            APP.getData("Search");
        });

        let savedBtn = document.querySelector("#saved-btn");
        savedBtn.addEventListener("click", (ev) => {
            ev.preventDefault();

            // if there are no drinks in localStorage, do not continue
            if (APP.drinks.length === 0) {
                APP.displayMessage("No Results Saved", "#bd1f36"); 
                return;
            }

            APP.getData("Saved");
        });
    },

    getData: async (method) => {
        // reset the inner html for every time search or saved btn is pressed
        APP.drinksList.innerHTML = "";

        // change value of drinksData based on the method of btn used
        let drinksData;

        switch (method) {
            case "Search":
                let drink = APP.searchInput.value.trim();
                APP.searchInput.value = "";

                // if there is no input, do not continue
                if (drink === "") {
                    APP.displayMessage("Please enter a valid name.", "#bd1f36");
                    return;
                }

                APP.displayMessage(`Searching for ${drink}...`, "#bdb21f");
            
                drinksData = await SEARCH.fetchData(drink);
                console.log(drinksData);
                
                break;
            case "Saved":
                drinksData = await SAVED.getSavedDrinks(APP.drinks);
                console.log(drinksData);
                break;
        
            default:
                console.log("No method was passed in.");
                break;
        }

        // if there is something in drinksData, then continue
        if (drinksData) {
            APP.displayDrinks(method, drinksData);
        }
    },

    displayDrinks: (method, drinks) => {
        let df = new DocumentFragment();

        drinks.forEach((drink) => {
            let card = APP.displayImage(drink);

            df.append(card);

            card.addEventListener("click", (ev) => {
                ev.preventDefault();
                APP.openDialog(method, drink);
            });
        });

        APP.drinksList.append(df);
        console.log(APP.drinksList);
    },

    displayImage: ({idDrink, strDrinkThumb, strDrink}) => {
        let card = document.createElement("li");
        card.classList.add("card");
        card.setAttribute("data-id", `${idDrink}`);
    
        card.innerHTML = `
        <div class="card__image">
            <img src="${strDrinkThumb}" alt="picture of ${strDrink} drink">
        </div>
        <div class="card__content">
            <h3 class="card__content-title">${strDrink}</h3>
        </div>
        `
        
        return card;
    },

    openDialog: (method, {idDrink, strDrink, strDrinkThumb, strInstructions}) => {
        const dialog = document.querySelector("#dialog");
        dialog.innerHTML = "";

        let df = new DocumentFragment();

        let container = document.createElement("div");
        container.classList.add("container");
        container.innerHTML = `
        <h3 class="dialog__content-title">${strDrink}</h3>
        <div class="dialog__image">
            <img src="${strDrinkThumb}" alt="picture of ${strDrink} drink">
        </div>
        <div class="dialog__content">
            <h4 class="dialog__content-subtitle">Instructions</h4>
            <p class="dialog__content-text">${strInstructions}</p>
            <button class="btn" id="cancel-btn">Cancel</button>
        </div>
        `

        // if method is search, add a save button, otherwise don't
        switch (method) {
            case "Search":
                // if idDrink already exists in the local storage, change content of save button
                let saveDrinkBtnContent = "Save Drink";

                let saveBtnDOM = document.createElement("button");
                saveBtnDOM.classList.add("btn");
                saveBtnDOM.setAttribute("id", "saveDrink-btn");

                console.log(APP.drinks);
                if (APP.drinks.includes(idDrink)) {
                    saveBtnDOM.setAttribute("disabled", "");
                    saveDrinkBtnContent = "Already saved";
                }

                saveBtnDOM.innerText = saveDrinkBtnContent;

                container.append(saveBtnDOM);
                break;

            case "Saved":
                console.log("Saved");
                break;
        
            default:
                console.log("No method passed in");
                break;
        }

        df.append(container);
        dialog.append(df);

        let cancelBtn = dialog.querySelector("#cancel-btn");
        cancelBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            dialog.close();
        });
        
        if (method === "Search") {
            let saveBtn = dialog.querySelector("#saveDrink-btn");
            saveBtn.addEventListener("click", () => {
                APP.drinks.push(idDrink);
                localStorage.setItem("drinkIDs", JSON.stringify(APP.drinks));
                saveBtn.setAttribute("disabled", "");
                saveBtn.innerText = "Saved";
            });
        }
        console.log(dialog);
        dialog.showModal();
    },

    displayMessage: (newMessage="Search for Images", newColor="#000") => {
        let message = document.getElementById('message');
        message.innerText = newMessage;
        message.style.color = newColor;
    }
}

window.addEventListener("DOMContentLoaded", APP.init);

export default APP;