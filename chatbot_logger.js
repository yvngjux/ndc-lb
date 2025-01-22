class ChatbotLogger {
    constructor() {
        this.SPREADSHEET_ID = '1NOSBxAzHNfkBY_VqqYpNVZjTfXvB7D11aGHRbvyr7Q8';
        this.SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxCazIDpaG96kbyxaxo9OERlcQZu5Hl1M9YnSTysGNkWpazaPc2f8Vpol2F_jym8PM/exec';
    }

    async getUserLocation() {
        try {
            if ('geolocation' in navigator) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                return `${position.coords.latitude}, ${position.coords.longitude}`;
            }
            return 'Location not available';
        } catch (error) {
            console.error('Error getting location:', error);
            return 'Location access denied';
        }
    }

    async logInteraction(userQuestion, chatbotResponse) {
        try {
            const now = new Date();
            const timestamp = now.toISOString();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString();
            const location = await this.getUserLocation();

            // Create URL with parameters
            const url = new URL(this.SCRIPT_URL);
            url.searchParams.append('timestamp', timestamp);
            url.searchParams.append('date', date);
            url.searchParams.append('time', time);
            url.searchParams.append('question', userQuestion);
            url.searchParams.append('response', chatbotResponse);
            url.searchParams.append('location', location);

            console.log('Sending data to Google Sheet:', {
                timestamp,
                date,
                time,
                userQuestion,
                chatbotResponse,
                location
            });

            // Make the request
            const response = await fetch(url.toString(), {
                method: 'GET',
                mode: 'no-cors'
            });

            console.log('Response received:', response);
            console.log('Successfully logged to Google Sheet');
        } catch (error) {
            console.error('Error logging to Google Sheet:', error);
        }
    }
} 