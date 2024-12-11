type Input = {
  text:string,
  color?:string,
}

const Button = (inp:Input) => {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur group-hover:opacity-100 transition duration-200"
        aria-hidden="true"
      ></div>
      <button
        className={`relative px-12 py-4 text-3xl sm:text-4xl font-semibold text-gray-900 ${inp.color? inp.color : "bg-white"} rounded-full transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg`}
      >
        {inp.text}
      </button>
    </div>
  );
};

export default Button;
