import APP from "./main.js";

const SAVED = {
    getLocalStorage: (drinks) => {        
        // get the items from local storage, convert from JSON to a JS array
        let drinkIDs = JSON.parse(localStorage.getItem("drinkIDs"));
        console.log("DrinkIDs from local storage:", drinkIDs);
        
        // if drinkIDs array has items, spread each item and push to global drinks array
        if (drinkIDs) {
            drinks.push(...drinkIDs);
            return drinks;
        } else {
            return [];
        }
    },

    getSavedDrinks: async (drinks) => { 
        const drinksData = await Promise.all(SAVED.fetchSavedData(drinks));

        APP.displayMessage("Saved Results", "#258415");
        return drinksData;
    },

    fetchSavedData: (drinks) => {
        let drinkData = drinks.map(async (drinkID) =>  {
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
    }
}

export default SAVED;
