import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "../features/authSlice";
import { CgSpinner } from "react-icons/cg";
import ReCAPTCHA from "react-google-recaptcha";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
};

type PasswordRequirements = {
  minLength: boolean;
  uppercase: boolean;
  number: boolean;
  specialCharacter: boolean;
};

type Errors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
};

const Home: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const dispatch = useDispatch();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    minLength: false,
    uppercase: false,
    number: false,
    specialCharacter: false,
  });

  // Validation Regex
  const passwordValidation = {
    minLength: /.{8,}/,
    uppercase: /[A-Z]/,
    number: /[0-9]/,
    specialCharacter: /[!@#$%^&*(),.?":{}|<>/]/,
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token); // Store CAPTCHA token
  };
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    // Validation de l'email
    if (name === "email") {
      if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = "Adresse email invalide";
      } else {
        delete newErrors.email;
      }
    }

    // Validation du mot de passe et vérification des exigences
    if (name === "password") {
      if (!isLogin) {
        const newReqs = {
          minLength: passwordValidation.minLength.test(value),
          uppercase: passwordValidation.uppercase.test(value),
          number: passwordValidation.number.test(value),
          specialCharacter: passwordValidation.specialCharacter.test(value),
        };
        setPasswordRequirements(newReqs);
      }

      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    // Validation de la confirmation du mot de passe
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    // Validation du nom
    if (!isLogin && name === "name") {
      if (!value.trim()) {
        newErrors.name = "Le nom est requis";
      } else {
        delete newErrors.name;
      }
    }

    setErrors(newErrors);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation finale du formulaire
    const newErrors: Errors = {};
    if (!formData.email) newErrors.email = "L'email est requis";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    if (!isLogin && !formData.name) newErrors.name = "Le nom est requis";
    if (!isLogin && !formData.confirmPassword) newErrors.confirmPassword = "La confirmation du mot de passe est requise";

    if (!isLogin && Object.values(passwordRequirements).some((req) => !req)) {
      newErrors.password = "Le mot de passe doit répondre à toutes les exigences";
    }
    if (!isLogin && !captchaToken) {
      toast.error("Le CAPTCHA est requis");
      return;
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      const data = {
        email: formData.email,
        password: formData.password,
        name: !isLogin ? formData.name : undefined,
        confirmPassword: !isLogin ? formData.confirmPassword : undefined,
        captchaToken, // Inclure le token CAPTCHA
      };

      const apiEndpoint = isLogin ? "/login" : "/signup";

      try {
        // Envoi de la requête POST à l'API
        const response = await axios.post(`https://cafeteria-projet.vercel.app${apiEndpoint}`, data);

        if ((isLogin && response.data?.UserLogged) || (!isLogin && response.data?.UserCreated)) {
          toast.success(response.data.message);
          if (!isLogin) setIsLogin(true);
          if (isLogin) {
            dispatch(login({ email: formData.email, username: response.data.username, role: response.data.role }));
          }

        }
      } catch (error: any) {
        console.error("Erreur :", error.response || error);
        toast.error(error.response?.data.message || error.message);
      }

      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: isLogin ? -50 : 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: isLogin ? -50 : 50 },
  };


  return (
    <div className="h-full w-full bg-black">
      <div className="absolute w-full h-full">
        <img
          src="./agoraCMC.png"
          className="absolute w-full h-full top-0 left-0 object-cover"
          alt=""
        />
        <div className="absolute w-full h-full top-0 left-0 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-black/40 before:to-transparent before:pointer-events-none"></div>
      </div>

      <div className="z-50  h-full w-full flex md:flex-row flex-col items-center justify-around text-white">


        <div className="md:w-96 max-h-[90vh] overflow-y-scroll scrollbar-none mx-auto mb-5 overflow-hidden bg-white z-50 bg-opacity-95 p-6 rounded-lg shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {isLogin ? "Connexion" : "Inscription"}
              </h2>
              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-600" htmlFor="name">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B9CB8]"
                      placeholder="Entrez votre nom"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-600" htmlFor="email">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B9CB8]"
                    placeholder="Entrez votre e-mail"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-600" htmlFor="password">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B9CB8]"
                    placeholder="Créez un mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {!isLogin && (
                    <div className="text-sm text-slate-400 mt-2">
                      {Object.entries(passwordRequirements).map(([key, valid]) => (
                        <div key={key} className="flex items-center gap-2">
                          {valid ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : (
                            <FaTimesCircle className="text-red-500" />
                          )}
                          <span>{`Le mot de passe doit contenir ${key.replace("specialCharacter", "un caractère spécial")}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {!isLogin && (
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1 text-gray-600"
                      htmlFor="confirmPassword"
                    >
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B9CB8]"
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}
                {!isLogin && <ReCAPTCHA className="flex items-center justify-center mb-4" sitekey={'6LfEHYQqAAAAAJSUdHZw47xz92eGXv43FlGD4n-d'} onChange={handleCaptchaChange} />}
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-[#2B9CB8] text-white rounded-lg shadow-md hover:bg-[#256a8c] transition-colors"
                >
                  {loading ? (<CgSpinner className="rotate inline-block animate-spin" />) : isLogin ? "Connexion" : "Inscription"}
                </button>
              </form>
              <p className="mt-4 text-sm text-gray-600">
                {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}{" "}
                <span
                  onClick={() => setIsLogin((prev) => !prev)}
                  className="text-[#2B9CB8] cursor-pointer hover:underline"
                >
                  {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
                </span>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Home;
