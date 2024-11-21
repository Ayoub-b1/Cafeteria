import React, { useMemo, memo } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "./store/index";
import Home from "./pages/Home";
import Main from "./pages/Main";
import './App.css'
import Navbar from "./components/Navbar";
import Menu from "./pages/Menu";
// Main App Component
const App = () => {
  const location = useLocation();

  // Memoize the selectors to prevent unnecessary re-renders
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Combine user and authentication state to prevent recalculation during re-renders
  const isUserLoggedIn = useMemo(() => isAuthenticated && user, [isAuthenticated, user]);

  return (
    <>
      
      {isUserLoggedIn && <Navbar />}
      <AnimatePresence mode="wait">


        <Routes location={location} key={location.pathname}>
          {!isUserLoggedIn ? (
            <Route
              path="/"
              element={
                <PageWrapper>
                  <Home />
                </PageWrapper>
              }
            />
          ) : (
            <>
              <Route
                path="/"
                element={
                  <PageWrapper>
                    <Main />
                  </PageWrapper>
                }
              />
              <Route
                path="/Menu"
                element={
                  <PageWrapper>
                    <Menu />
                  </PageWrapper>
                }
              />
            </>
          )}
        </Routes>
      </AnimatePresence>
    </>
  );
};

// PageWrapper Component wrapped in React.memo to prevent unnecessary re-renders
const PageWrapper = memo(({ children }: React.PropsWithChildren) => {
  return (
    <motion.div
      initial={{
        clipPath: "inset(0 50% 0 50%)", // Start with the page split in the middle
        opacity: 0,
        scale: 0.95, // Slightly zoomed out to add depth
      }}
      animate={{
        clipPath: "inset(0 0 0 0)", // Expand to full page
        opacity: 1,
        scale: 1, // Zoom to normal size
      }}
      exit={{
        clipPath: "inset(0 50% 0 50%)", // Split again on exit
        opacity: 0,
        scale: 0.95, // Zoom out during exit
      }}
      className="h-screen relative overflow-hidden bg-black "
      style={{ backgroundColor: "black", willChange: "clip-path, opacity, transform" }}
      transition={{
        duration: .7,
        ease: "easeInOut",
      }}
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
  );
});

// Root Component to wrap everything with Router
const Root = () => (
  <>
    <Router>
      <App />
    </Router>
  </>
);

export default Root;
