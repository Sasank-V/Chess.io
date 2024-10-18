
const CloseButton = ({text}) => {
    return (
        <div className="relative">
          <div
            className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-400 rounded-full blur group-hover:opacity-100 transition duration-200"
            aria-hidden="true"
          ></div>
          <button
            className="relative px-12 py-4 text-3xl sm:text-4xl font-semibold text-white bg-red-400 rounded-full transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg"
          >
            {text}
          </button>
        </div>
      );
}

export default CloseButton