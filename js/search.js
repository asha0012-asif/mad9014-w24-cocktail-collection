import APP from "./main.js";

const SEARCH = {
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

            if (data.drinks) {
                APP.displayMessage(`Search results for ${drink}.`, "#258415");
                return data.drinks;
            }

            APP.displayMessage(`No results found for ${drink}.`, "#bd1f36");

        } catch (err) {
            console.log(err);
        }
    }
}

export default SEARCH;
