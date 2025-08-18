import Elysia from 'elysia';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { Vendor } from '../../vendors/_model';

const vendorsAnalytics = new Elysia()
  .use(isSessionAuth('admin'))
  .get('/vendors/analytics', async ({ set }) => {
    try {
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const [totalVendors, approvedVendors, pendingVendors, activeVendors, thisMonthVendors, lastMonthVendors] = await Promise.all([
        Vendor.countDocuments({}),
        Vendor.countDocuments({ isApproved: true }),
        Vendor.countDocuments({ isApproved: false }),
        Vendor.countDocuments({ isActive: true }),
        Vendor.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
        Vendor.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      ]);

      const trendingChange = lastMonthVendors === 0
        ? 100
        : ((thisMonthVendors - lastMonthVendors) / lastMonthVendors) * 100;

      return SuccessHandler(set, 'Vendors analytics fetched', {
        totalVendors,
        approvedVendors,
        pendingVendors,
        activeVendors,
        thisMonthVendors,
        lastMonthVendors,
        trendingChange: Number(trendingChange.toFixed(1)),
      }, true);
    } catch (err) {
      throw ErrorHandler.ServerError(set, 'Error fetching vendors analytics', err);
    }
  });

export default vendorsAnalytics;
