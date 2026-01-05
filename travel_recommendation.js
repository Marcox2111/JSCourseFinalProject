let recommendationsData = null;

async function loadRecommendations() {
    if (recommendationsData) return recommendationsData;
    try {
        const response = await fetch('travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }
        recommendationsData = await response.json();
        console.log('Loaded recommendations:', recommendationsData);
        return recommendationsData;
    } catch (error) {
        console.error(error);
        renderMessage('Unable to load recommendations. Please try again later.');
        return null;
    }
}

function normalizeKeyword(raw) {
    const keyword = raw.trim().toLowerCase();
    if (!keyword) return null;
    if (keyword.includes('beach')) return 'beach';
    if (keyword.includes('temple')) return 'temple';
    if (keyword.includes('country') || keyword.includes('countries')) return 'country';
    return null;
}

function getRecommendationsByKeyword(data, keyword) {
    if (!data) return [];
    switch (keyword) {
        case 'beach':
            return data.beaches || [];
        case 'temple':
            return data.temples || [];
        case 'country':
            return (data.countries || []).flatMap(country =>
                (country.cities || []).map(city => ({
                    ...city,
                    country: country.name
                }))
            );
        default:
            return [];
    }
}

function renderMessage(message) {
    const container = document.getElementById('results');
    if (!container) return;
    container.innerHTML = `<div class="no-results">${message}</div>`;
}

function renderRecommendations(list) {
    const container = document.getElementById('results');
    if (!container) return;
    container.innerHTML = '';

    if (!list || list.length === 0) {
        renderMessage('No recommendations found. Try "beach", "temple", or "country".');
        return;
    }

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'result-card';

        const image = document.createElement('img');
        image.src = item.imageUrl;
        image.alt = item.name;

        const body = document.createElement('div');
        body.className = 'result-body';

        const title = document.createElement('h3');
        title.textContent = item.name;

        const description = document.createElement('p');
        description.textContent = item.description;

        const visit = document.createElement('button');
        visit.className = 'visit-btn';
        visit.type = 'button';
        visit.textContent = 'Visit';

        body.appendChild(title);
        body.appendChild(description);
        body.appendChild(visit);

        card.appendChild(image);
        card.appendChild(body);

        container.appendChild(card);
    });
}

async function handleSearch(event) {
    event.preventDefault();
    const input = document.getElementById('searchInput');
    if (!input) return;

    const keyword = normalizeKeyword(input.value);
    if (!keyword) {
        renderMessage('Please enter "beach", "temple", or "country" to see recommendations.');
        return;
    }

    const data = await loadRecommendations();
    const results = getRecommendationsByKeyword(data, keyword);
    renderRecommendations(results);
}

function handleClear() {
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    renderMessage('Recommendations will appear here after you search.');
}

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-bar');
    const clearBtn = document.getElementById('btnClear');

    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }

    // initial helper text
    renderMessage('Recommendations will appear here after you search.');
});
