const Loader = ({ fullscreen = false, text = "Loading..." }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullscreen ? "min-h-screen" : "py-12"
      }`}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">{text}</p>
    </div>
  );
};

export default Loader;
