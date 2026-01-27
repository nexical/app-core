export default {
    type: 'feature',
    order: 50,
    vite: {
        optimizeDeps: {
            include: ['bcryptjs']
        }
    }
};
