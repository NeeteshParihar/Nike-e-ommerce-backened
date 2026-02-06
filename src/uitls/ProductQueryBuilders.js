
export const queryForUpdatingBasicDetails = ({ basePrice, description, details, status }) => {

    const query = {};
    if (basePrice) query.basePrice = basePrice;
    if (description) query.description = description;
    if (details) query.details = details;
    if( status ) query.status = status;   

    return query;
}


export const getProductParamsForCategoryUpdate = (action, categoryId)=>{

    if(action.toLowerCase() === "add"){
        return { $addToSet: { categoryIds: categoryId } };
    }else if(action.toLowerCase() === "remove"){
        return { $pull: { categoryIds: categoryId } };
    }
    return {};
}