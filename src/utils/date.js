const months = ['January', 'February', 'March', 'April', 'May', 'June', 
               'July', 'August', 'September', 'October', 'November', 'December'];

const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    if (year === now.getFullYear()) {
        return `${getOrdinal(day)} ${month}`;
    }
    return `${getOrdinal(day)} ${month} ${year}`;
};

module.exports = {
    formatDate
}; 