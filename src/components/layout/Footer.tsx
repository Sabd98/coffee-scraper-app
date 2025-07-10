import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-amber-950 text-white py-6">
      <div className="container mx-auto text-center">
        <p>
          © {new Date().getFullYear()} CoffeeScraper - Coffee Product Data
          Analysis
        </p>
      </div>
    </footer>
  );
}

export default Footer