// api.js

// --- Global State ---
let totalSolved = 0;
let totalContests = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Fetch all stats in parallel
    Promise.all([
        fetchCodeforcesStats(),
        fetchLeetCodeStats(),
        // These are placeholders as they don't have reliable public APIs
        fetchCodeChefStats(),
        fetchGeeksForGeeksStats()
    ]).then(() => {
        // Update the dashboard once all fetches are complete
        updateDashboard();
    });
});

// --- API Fetching Functions ---

async function fetchCodeforcesStats() {
    const username = 'SumitXorY';
    const url = `https://codeforces.com/api/user.info?handles=${username}`;
    const contestsUrl = `https://codeforces.com/api/user.rating?handle=${username}`;
    
    try {
        // Fetch user info for rank and rating
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok for Codeforces');
        const data = await response.json();

        if (data.status === 'OK') {
            const user = data.result[0];
            updateElement('codeforces-rating', `${user.rank} (${user.rating})`);
        } else {
            throw new Error('Failed to fetch Codeforces user data');
        }

        // Fetch contest history for contest count
        const contestsResponse = await fetch(contestsUrl);
        if (!contestsResponse.ok) throw new Error('Network response was not ok for Codeforces contests');
        const contestsData = await contestsResponse.json();

        if (contestsData.status === 'OK') {
            totalContests += contestsData.result.length;
        } else {
            throw new Error('Failed to fetch Codeforces contest data');
        }

    } catch (error) {
        console.error('Codeforces API Error:', error);
        updateElement('codeforces-rating', 'Unavailable');
    }
}

async function fetchLeetCodeStats() {
    const username = 'sumit_chauhan_';
    const url = `https://alfa-leetcode-api.onrender.com/${username}`;
    const contestUrl = `https://alfa-leetcode-api.onrender.com/${username}/contest`;

    try {
        // Fetch general stats for total solved
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok for LeetCode');
        const data = await response.json();
        
        if (data.totalSolved) {
            totalSolved += data.totalSolved;
        }

        // Fetch contest stats for rating and contest count
        const contestResponse = await fetch(contestUrl);
        if (!contestResponse.ok) throw new Error('Network response was not ok for LeetCode contests');
        const contestData = await contestResponse.json();

        if (contestData.contestParticipation) {
            totalContests += contestData.contestParticipation.length;
            const latestContest = contestData.contestParticipation[0];
            if (latestContest) {
                const rating = Math.round(latestContest.rating);
                let rank = "Knight";
                if (rating >= 2200) rank = "Guardian";
                updateElement('leetcode-rating', `${rank} (${rating})`);
            } else {
                updateElement('leetcode-rating', 'Knight (1966)');
            }
        } else {
            updateElement('leetcode-rating', 'Knight (1966)');
        }

    } catch (error) {
        console.error('LeetCode API Error:', error);
        updateElement('leetcode-rating', 'Knight (1966)');
    }
}

async function fetchCodeChefStats() {
    // Placeholder - no reliable public API
}

async function fetchGeeksForGeeksStats() {
    // Placeholder - no reliable public API
}


// --- Helper Functions ---

function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
}

function updateDashboard() {
    updateElement('total-solved', totalSolved > 0 ? totalSolved : '...');
    updateElement('total-contests', totalContests > 0 ? totalContests : '...');
}
