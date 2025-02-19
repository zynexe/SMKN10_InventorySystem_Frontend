// Pagination.js (Create a new file named Pagination.js)
import React from 'react';

function Pagination({ currentPage, setCurrentPage, totalPages }) {
    const renderPagination = () => {
        let pages = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        if (startPage > 1) {
            pages.push(
                <button key={1} onClick={() => setCurrentPage(1)}>1</button>
            );
            if (startPage > 2) {
                pages.push(<span key="start-ellipsis">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={currentPage === i ? "active" : ""}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="end-ellipsis">...</span>);
            }
            pages.push(
                <button key={totalPages} onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>❮</button>
            {renderPagination()}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>❯</button>
        </div>
    );
}

export default Pagination;