import {Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider, useAuth} from './auth/AuthContext';
import {ProtectedRoute} from './auth/ProtectedRoute';
import {Layout} from './components/Layout';
import {Toaster} from './components/ui/toaster';
import {LoginPage} from './pages/LoginPage';
import {MyCardsPage} from './pages/user/MyCardsPage';
import {CardDetailPage} from './pages/user/CardDetailPage';
import {TransfersPage} from './pages/user/TransfersPage';
import {AllCardsPage} from './pages/admin/AllCardsPage';
import {UsersPage} from './pages/admin/UsersPage';
import {BlockRequestsPage} from './pages/admin/BlockRequestsPage';


function HomeRedirect() {
    const {isAuthenticated, isAdmin} = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace/>;
    return <Navigate to={isAdmin ? '/admin/cards' : '/user/cards'} replace/>;
}

export default function App() {
    return (
        <AuthProvider>
            <Toaster/>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/" element={<HomeRedirect/>}/>

                {/* USER */}
                <Route element={<ProtectedRoute role="USER"/>}>
                    <Route element={<Layout/>}>
                        <Route path="/user/cards" element={<MyCardsPage/>}/>
                        <Route path="/user/cards/:id" element={<CardDetailPage/>}/>
                        <Route path="/user/transfers" element={<TransfersPage/>}/>
                    </Route>
                </Route>

                {/* ADMIN */}
                <Route element={<ProtectedRoute role="ADMIN"/>}>
                    <Route element={<Layout/>}>
                        <Route path="/admin/cards" element={<AllCardsPage/>}/>
                        <Route path="/admin/users" element={<UsersPage/>}/>
                        <Route path="/admin/block-requests" element={<BlockRequestsPage/>}/>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </AuthProvider>
    );
}