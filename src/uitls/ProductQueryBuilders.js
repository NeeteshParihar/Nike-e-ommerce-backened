
export const queryForUpdatingBasicDetails = ({ basePrice, description, details }) => {

    const query = {};
    if (basePrice) query.basePrice = basePrice;
    if (description) query.description = description;
    if (details) query.details = details;

    return query;
}