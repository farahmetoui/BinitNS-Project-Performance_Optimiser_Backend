export const paginateArray = async (data: any[], page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const paginatedData = data.slice(skip, skip + limit);
    const totalPages = Math.ceil(data.length / limit);
  
    return {
      data: paginatedData,  // Les données pour la page actuelle
      currentPage: page,
      totalPages,  // Nombre total de pages
      totalItems: data.length,  // Nombre total d'éléments
    };
  };
  