import React, { useMemo, memo, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store/index";
import { logout } from "./features/authSlice";
import { FiLogOut } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import './App.css';
import Suivi from "./pages/Suivi";

// Lazy load components
const Navbar = lazy(() => import("./components/Navbar"));
const Home = lazy(() => import("./pages/Home"));
const Main = lazy(() => import("./pages/Main"));
const Menu = lazy(() => import("./pages/Menu"));
const Chef = lazy(() => import("./pages/Chef"));

// Memoize transition configuration
const pageTransition = {
  initial: {
    clipPath: "inset(0 50% 0 50%)",
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    clipPath: "inset(0 0 0 0)",
    opacity: 1,
    scale: 1,
  },
  exit: {
    clipPath: "inset(0 50% 0 50%)",
    opacity: 0,
    scale: 0.95,
  },
  transition: {
    duration: 0.7,
    ease: "easeInOut",
  }
};

// Memoized selector functions
const selectUser = (state: RootState) => state.auth.user;
const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

// Memoized LoadingFallback component
const LoadingFallback = memo(() => (
  <div className="h-screen flex items-center justify-center bg-white text-white">

  </div>
));

// Memoized LogoutButton component
const LogoutButton = memo(({ onLogout }: { onLogout: () => void }) => (
  <button
    onClick={onLogout}
    className="absolute right-4 top-4 text-white rounded-xl z-50"
  >
    <FiLogOut
      className="text-red-600 filter drop-shadow-xl shadow-white hover:scale-105"
      size={40}
    />
  </button>
));

// Memoized PageWrapper component with typed props
interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper = memo(({ children }: PageWrapperProps) => (
  <motion.div
    {...pageTransition}
    className="md:h-screen min-h-[100vh] relative overflow-hidden bg-black"
    style={{ backgroundColor: "black", willChange: "clip-path, opacity, transform" }}
  >
    <motion.div
      className="absolute w-full h-full"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 10,
      }}
    >
      {children}
    </motion.div>
  </motion.div>
));

PageWrapper.displayName = 'PageWrapper';

// Main App Component
const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Use memoized selectors
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector((state: RootState) => state.auth.role);

  // Memoize authentication check
  const isUserLoggedIn = useMemo(
    () => isAuthenticated && user,
    [isAuthenticated, user]
  );

  // Memoize logout handler
  const handleDisconnect = useMemo(
    () => () => {
      dispatch(logout());
      navigate('/');
    },
    [dispatch, navigate]
  );

  // Memoize toaster configuration
  const toasterConfig = useMemo(() => ({
    containerStyle: {
      zIndex: 99999,
    },
  }), []);

  return (
    <>
      <AnimatePresence mode="wait">
        <Toaster containerStyle={toasterConfig.containerStyle} />
        {isUserLoggedIn && (
          <Suspense fallback={<LoadingFallback />}>

            {role !== 'admin' &&
              <Navbar />

            }
            <LogoutButton onLogout={handleDisconnect} />
          </Suspense>
        )}

        <Routes location={location} key={location.pathname}>
          {!isUserLoggedIn ? (
            <Route
              path="/"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <PageWrapper>
                    <Home />
                  </PageWrapper>
                </Suspense>
              }
            />
          ) : (
            <>
              {role === "admin" ? (
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <PageWrapper>
                        <Chef />
                      </PageWrapper>
                    </Suspense>
                  }
                />
              ) : (
                <>
                  <Route
                    path="/"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <PageWrapper>
                          <Main />
                        </PageWrapper>
                      </Suspense>
                    }
                  />
                  <Route
                    path="/Menu"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <PageWrapper>
                          <Menu />
                        </PageWrapper>
                      </Suspense>
                    }
                  />
                  <Route
                    path="/Suivi"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <PageWrapper>
                          <Suivi />
                        </PageWrapper>
                      </Suspense>
                    }
                  />
                </>
              )}
            </>
          )}
        </Routes>
      </AnimatePresence>
    </>
  );
};


// Root Component
const Root = () => (
  <Router>
    <App />
  </Router>
);

export default Root;