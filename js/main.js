const APP = {
    key: "drink",
    searchInput: document.querySelector("#search-input"),
    drinksList: document.querySelector("#drinks-list"),
    drinks: [],

    init: () => {
        console.log("App initialized.");
        
        APP.getLocalStorage();
        APP.eventListeners();
    },

    eventListeners: () => {
        let searchBtn = document.querySelector("#search-btn");
        searchBtn.addEventListener("click", APP.validateSearch);

        let savedBtn = document.querySelector("#saved-btn");
        savedBtn.addEventListener("click", APP.getSavedDrinks);
    },

    getLocalStorage: () => {        
        // get the items from local storage, convert from JSON to a JS array
        let drinkIDs = JSON.parse(localStorage.getItem("drinkIDs"));
        console.log("DrinkIDs from local storage:", drinkIDs);
        
        // if drinkIDs array has items, spread each item and push to global drinks array
        if (drinkIDs) {
            APP.drinks.push(...drinkIDs);
        } else {
            
        }
    },

    getSavedDrinks: async (ev) => {
        ev.preventDefault();

        // reset the inner html for every time saveBtn is pressed
        APP.drinksList.innerHTML = "";

        const drinksData = await Promise.all(APP.fetchSavedData());
        console.log(drinksData);

        if (drinksData.length !== 0) {     
            console.log("Data found");

            APP.displayMessage("Saved Results");
            APP.displayDrinks("Saved", drinksData);
        } else {
            console.log("Data found");
            APP.displayMessage("No results saved", "#bd1f36");
        }
    },

    fetchSavedData: () => {
        let drinkData = APP.drinks.map(async (drinkID) =>  {
            console.log(drinkID);

            try {
                const BASE_URL = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?api-key=1&i=${drinkID}`;

                let response = await fetch(BASE_URL);
                // console.log(response);

                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                let data = await response.json();
                // console.log(data);

                // each data results array has only one data object at index 0
                return data.drinks[0];
                
            } catch (err) {
                console.log(err);
            }
        });

        return drinkData;
    },

    validateSearch: (ev) => {
        ev.preventDefault();

        // reset the inner html for every new search
        APP.drinksList.innerHTML = "";
        
        let drink = APP.searchInput.value.trim();
        APP.searchInput.value = "";

        // if there is no input, display relevant message and do not continue
        if (drink === "") {
            APP.displayMessage("Please enter a valid name.", "#bd1f36");
            return;
        } else {
            APP.displayMessage(`Searching for ${drink}...`, "#bdb21f");
            APP.fetchData(drink);
        }

    },

    fetchData: async (drink) => {
        // create an actual URL object
        const BASE_URL = `https://www.thecocktaildb.com/api/json/v1/1/search.php?api-key=1&s=${drink}`;

        try {
            let response = await fetch(BASE_URL);
            console.log(response);

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            let data = await response.json();
            console.log(data);

            if (!data.drinks) {
                APP.displayMessage(`No results found for ${drink}.`, "#bd1f36");
                return;
            } else {
                APP.displayMessage(`Search results for ${drink}.`, "#258415");
                APP.displayDrinks("Search", data.drinks);
            }
        } catch (err) {
            console.log(err);
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