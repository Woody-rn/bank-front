import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Heading } from '@chakra-ui/react';

export default function App() {
  return (
      <Box minH="100vh">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
              path="/login"
              element={
                <Box p={8}>
                  <Heading>Bank Front — скелет готов</Heading>
                </Box>
              }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
  );
}