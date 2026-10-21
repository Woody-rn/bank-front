import { Routes, Route, Navigate } from 'react-router-dom';
import { Heading } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { Toaster } from './components/ui/toaster'; // Подключаем тостер
import { LoginPage } from './pages/LoginPage';
import { MyCardsPage } from './pages/user/MyCardsPage';
import { CardDetailPage } from './pages/user/CardDetailPage';
import { TransfersPage } from './pages/user/TransfersPage';

// временные заглушки — заменим в следующих блоках
function Stub({ title }: { title: string }) {
    return <Heading>{title} — скоро</Heading>;
}

function HomeRedirect() {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Navigate to={isAdmin ? '/admin/cards' : '/user/cards'} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            {/* Компонент для отображения уведомлений (тостов) */}
            <Toaster />

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<HomeRedirect />} />

                {/* USER */}
                <Route element={<ProtectedRoute role="USER" />}>
                    <Route element={<Layout />}>
                        <Route path="/user/cards" element={<MyCardsPage />} />
                        <Route path="/user/cards/:id" element={<CardDetailPage />} />
                        <Route path="/user/transfers" element={<TransfersPage />} />
                    </Route>
                </Route>

                {/* ADMIN */}
                <Route element={<ProtectedRoute role="ADMIN" />}>
                    <Route element={<Layout />}>
                        <Route path="/admin/cards" element={<Stub title="Все карты" />} />
                        <Route path="/admin/users" element={<Stub title="Пользователи" />} />
                        <Route path="/admin/block-requests" element={<Stub title="Заявки на блокировку" />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}