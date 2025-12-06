// api.js

document.addEventListener('DOMContentLoaded', () => {
    // Fetch all stats in parallel
    fetchCodeforcesStats();
    fetchLeetCodeStats();
    // These are placeholders as they don't have reliable public APIs
    fetchCodeChefStats();
    fetchGeeksForGeeksStats();
});

// --- API Fetching Functions ---

async function fetchCodeforcesStats() {
    const username = 'SumitXorY';
    const userInfoUrl = `https://codeforces.com/api/user.info?handles=${username}`;
    const userStatusUrl = `https://codeforces.com/api/user.status?handle=${username}`;
    
    try {
        // Fetch user info for rank and rating
        const infoResponse = await fetch(userInfoUrl);
        if (!infoResponse.ok) throw new Error('Network response was not ok for Codeforces user info');
        const infoData = await infoResponse.json();

        if (infoData.status === 'OK') {
            const user = infoData.result[0];
            const rating = user.rating || 'Unrated';
            updateElement('codeforces-rating', `${user.rank || ''} (${rating})`);
            updateElement('codeforces-dashboard-rating', rating);
        } else {
            throw new Error('Failed to fetch Codeforces user data');
        }

        // Fetch user status for total solved problems
        const statusResponse = await fetch(userStatusUrl);
        if (!statusResponse.ok) throw new Error('Network response was not ok for Codeforces user status');
        const statusData = await statusResponse.json();

        if (statusData.status === 'OK') {
            const solvedProblems = new Set(
                statusData.result
                    .filter(submission => submission.verdict === 'OK')
                    .map(submission => submission.problem.name)
            );
            updateElement('codeforces-total-solved', solvedProblems.size);
        } else {
            throw new Error('Failed to fetch Codeforces status data');
        }

    } catch (error) {
        console.error('Codeforces API Error:', error);
        updateElement('codeforces-rating', 'Unavailable');
        updateElement('codeforces-dashboard-rating', 'N/A');
        updateElement('codeforces-total-solved', 'N/A');
    }
}

async function fetchLeetCodeStats() {
    const username = 'sumit_chauhan_';
    const url = `https://alfa-leetcode-api.onrender.com/${username}`;
    const contestUrl = `https://alfa-leetcode-api.onrender.com/${username}/contest`;

    try {
        // Fetch general stats for solved counts
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network response was not ok for LeetCode: ${response.statusText}`);
        const data = await response.json();
        
        // More robust check for the existence of properties
        if (data && data.totalSolved !== undefined) {
            updateElement('leetcode-total-solved', data.totalSolved);
            updateElement('leetcode-easy-solved', data.easySolved);
            updateElement('leetcode-medium-solved', data.mediumSolved);
            updateElement('leetcode-hard-solved', data.hardSolved);
        } else {
             // If the main stats are missing, use a fallback but don't throw an error yet
             console.error('Failed to parse LeetCode solved counts from response:', data);
             updateElement('leetcode-total-solved', '1400+');
             updateElement('leetcode-easy-solved', '350+');
             updateElement('leetcode-medium-solved', '850+');
             updateElement('leetcode-hard-solved', '200+');
        }

        // Fetch contest stats for rating
        const contestResponse = await fetch(contestUrl);
        if (!contestResponse.ok) throw new Error(`Network response was not ok for LeetCode contests: ${contestResponse.statusText}`);
        const contestData = await contestResponse.json();

        if (contestData.contestParticipation && contestData.contestParticipation.length > 0) {
            // Find the latest contest with a valid rating
            const latestContest = contestData.contestParticipation.find(c => c.rating > 0);
            if (latestContest) {
                const rating = Math.round(latestContest.rating);
                let rank = "Knight";
                if (rating >= 2200) rank = "Guardian";
                updateElement('leetcode-rating', `${rank} (${rating})`);
            } else {
                 updateElement('leetcode-rating', 'Knight (1966)'); // Fallback if no rated contests found
            }
        } else {
            updateElement('leetcode-rating', 'Knight (1966)'); // Fallback if no contest data
        }

    } catch (error) {
        console.error('LeetCode API Error:', error);
        updateElement('leetcode-rating', 'Knight (1966)'); // Fallback for profile section
        // Fallback for dashboard with static data
        updateElement('leetcode-total-solved', '1400+');
        updateElement('leetcode-easy-solved', '350+');
        updateElement('leetcode-medium-solved', '850+');
        updateElement('leetcode-hard-solved', '200+');
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
