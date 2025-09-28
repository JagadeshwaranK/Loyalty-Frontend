import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Grid,
  Paper,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Tabs,
  Tab,
  Pagination
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarsIcon from '@mui/icons-material/Stars';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { getUserProfile, getRewards, redeemReward, getUserRedemptions, getUserOrders, getPointsRate } from '../services/api';

const LoyaltyPage = () => {
  const [points, setPoints] = useState(0);
  const [rewardOptions, setRewardOptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [message, setMessage] = useState('');
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [currentPageRewards, setCurrentPageRewards] = useState(1);
  const [currentPageUnused, setCurrentPageUnused] = useState(1);
  const [currentPageActivity, setCurrentPageActivity] = useState(1);
  const [currentPageHistory, setCurrentPageHistory] = useState(1);
  const [pointsRate, setPointsRate] = useState(1.0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, rewardsRes, historyRes, ordersRes, pointsRateRes] = await Promise.all([
          getUserProfile(),
          getRewards(),
          getUserRedemptions(),
          getUserOrders(),
          getPointsRate()
        ]);
        setPoints(profileRes.data?.points || 0);
        setRewardOptions(rewardsRes.data || []);
        setHistory(historyRes.data || []);
        setOrders(ordersRes.data || []);
        setPointsRate(pointsRateRes.data?.[0]?.rate || 1.0);
      } catch (error) {
        console.error('Failed to fetch loyalty data', error);
        setMessage('Failed to load loyalty data. Please try again.');
        setPointsRate(1.0); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRedeem = async (reward) => {
    if (!reward || !reward.id) {
      setMessage('Invalid reward selected.');
      return;
    }
    setRedeeming(reward.id);
    try {
      const response = await redeemReward(reward.id);
      // Refresh points and history
      const profileResponse = await getUserProfile();
      setPoints(profileResponse.data?.points || 0);
      const historyRes = await getUserRedemptions();
      setHistory(historyRes.data || []);
      // Show dialog with full reward details
      setSelectedRedemption({
        ...response.data,
        reward: response.data.reward || reward // Use original reward if response lacks full details
      });
      setShowCouponDialog(true);
    } catch (error) {
      console.error('Failed to redeem reward', error);
      setMessage('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const getRewardDescription = (reward) => {
    if (!reward) return 'Unknown Reward';
    return reward.name || (() => {
      switch (reward.redemption_type) {
        case 'amount_discount':
          return `$${reward.amount_discount || 0} Amount Discount`;
        case 'free_shipping':
          return 'Free Shipping';
        case 'free_product':
          return `Free Product: ${reward.free_product_sku || 'Product'}`;
        default:
          return 'Unknown Reward';
      }
    })();
  };

  const getRewardDetails = (reward) => {
    if (!reward) return 'Unknown Reward';
    return reward.name || (() => {
      switch (reward.redemption_type) {
        case 'amount_discount':
          return `$${reward.amount_discount || 0} Amount Discount`;
        case 'free_shipping':
          return 'Free Shipping';
        case 'free_product':
          return `Free Product: ${reward.free_product_sku || 'Product'}`;
        default:
          return 'Unknown Reward';
      }
    })();
  };

  const unusedRedemptions = history.filter(item => !item.used);

  const getActivityItems = () => {
    const activity = [];

    // Add orders (points earned)
    orders.forEach(order => {
      const totalAmount = parseFloat(order.total_price) || 0;
      const effectiveRate = Number(pointsRate) || 1.0;
      const pointsEarned = Math.round(totalAmount * effectiveRate);
      activity.push({
        id: `order-${order.id}`,
        type: 'order',
        date: order.created_at,
        description: 'Placed an order',
        points: pointsEarned,
        amount: order.total_price
      });
    });

    // Add redemptions (points spent)
    history.forEach(item => {
      const rewardDetails = getRewardDetails(item.reward);
      const pointsSpent = item.reward?.points_required || 0;
      activity.push({
        id: `redemption-${item.id}`,
        type: 'redemption',
        date: item.redeemed_at,
        description: `Points spent on ${rewardDetails}`,
        points: -pointsSpent,
        coupon: item.coupon_code
      });
    });

    // Sort by date descending
    return activity.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const activityItems = getActivityItems();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePageChangeRewards = (event, value) => {
    setCurrentPageRewards(value);
  };

  const handlePageChangeUnused = (event, value) => {
    setCurrentPageUnused(value);
  };

  const handlePageChangeActivity = (event, value) => {
    setCurrentPageActivity(value);
  };

  const handlePageChangeHistory = (event, value) => {
    setCurrentPageHistory(value);
  };

  const paginatedRewards = rewardOptions.slice((currentPageRewards - 1) * itemsPerPage, currentPageRewards * itemsPerPage);
  const paginatedUnused = unusedRedemptions.slice((currentPageUnused - 1) * itemsPerPage, currentPageUnused * itemsPerPage);
  const paginatedActivity = activityItems.slice((currentPageActivity - 1) * itemsPerPage, currentPageActivity * itemsPerPage);
  const paginatedHistory = history.slice((currentPageHistory - 1) * itemsPerPage, currentPageHistory * itemsPerPage);

  const totalPagesRewards = Math.ceil(rewardOptions.length / itemsPerPage);
  const totalPagesUnused = Math.ceil(unusedRedemptions.length / itemsPerPage);
  const totalPagesActivity = Math.ceil(activityItems.length / itemsPerPage);
  const totalPagesHistory = Math.ceil(history.length / itemsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Loyalty Rewards
      </Typography>

      {message && (
        <Alert severity={message.includes('Failed') ? 'error' : 'success'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Dialog open={showCouponDialog} onClose={() => setShowCouponDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalOfferIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">{getRewardDescription(selectedRedemption?.reward)}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Spent {selectedRedemption?.reward?.points_required || 0} points
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {(() => {
              const rewardName = selectedRedemption?.reward?.name || '';
              const type = selectedRedemption?.reward?.redemption_type;
              if (type === 'amount_discount' || type === 'free_shipping') {
                return `Use this coupon for ${rewardName} on your next order!`;
              } else if (type === 'free_product') {
                return `You've redeemed a free ${selectedRedemption?.reward?.free_product_sku || 'product'}. Contact support or check your account for details.`;
              }
              return `Reward "${rewardName}" redeemed successfully!`;
            })()}
          </Typography>
          {(selectedRedemption?.reward?.redemption_type === 'amount_discount' || selectedRedemption?.reward?.redemption_type === 'free_shipping') && selectedRedemption?.coupon_code && (
            <Box sx={{ border: 1, borderColor: 'grey.300', p: 2, borderRadius: 1, mb: 2 }}>
              <Input
                value={selectedRedemption?.coupon_code || ''}
                readOnly
                fullWidth
                endAdornment={
                  <Button onClick={() => handleCopyCode(selectedRedemption?.coupon_code)} startIcon={<CopyAllIcon />}>
                    Copy Code
                  </Button>
                }
              />
            </Box>
          )}
          {selectedRedemption?.reward?.redemption_type === 'free_product' && (
            <Box sx={{ border: 1, borderColor: 'grey.300', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Free Product: {selectedRedemption?.reward?.free_product_sku || 'Product'}
              </Typography>
              <Input
                value={selectedRedemption?.reward?.free_product_sku || ''}
                readOnly
                fullWidth
                endAdornment={
                  <Button onClick={() => handleCopyCode(selectedRedemption?.reward?.free_product_sku || 'Free Product Details')} startIcon={<CopyAllIcon />}>
                    Copy Details
                  </Button>
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Contact support to claim your free product.
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary">
            This reward applies to one-time use.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCouponDialog(false)}>Close</Button>
          <Button 
            onClick={() => {
              const type = selectedRedemption?.reward?.redemption_type;
              if (type === 'amount_discount' || type === 'free_shipping') {
                handleCopyCode(selectedRedemption?.coupon_code);
              } else if (type === 'free_product') {
                handleCopyCode(selectedRedemption?.reward?.free_product_sku || 'Free Product Details');
              }
              setShowCouponDialog(false);
            }} 
            variant="contained" 
            color="primary"
          >
            Copy & Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Your Rewards Header */}
      <Card sx={{ mb: 3, p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h5" gutterBottom>
          Your Rewards
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {points.toLocaleString()} Points
        </Typography>
        <Typography variant="body1">
          You have {rewardOptions.length} reward{rewardOptions.length !== 1 ? 's' : ''} available
        </Typography>
      </Card>

      {/* Ways to Earn */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingCartIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Ways to Earn</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Card sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <ShoppingCartIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Place an order</Typography>
                <Typography variant="body1">Earn 10 point for every $1 spent on armor products</Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                sx={{ borderRadius: 2 }}
                onClick={() => window.location.href = '/products'}
              >
                Start Shopping
              </Button>
            </Stack>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* Ways to Redeem - Available Rewards */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalOfferIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Ways to Redeem</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ p: 0 }}>
            {rewardOptions.length === 0 ? (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                No rewards available at the moment. Check back later!
              </Typography>
            ) : (
              paginatedRewards.map((reward) => (
                <React.Fragment key={reward?.id || Math.random()}>
                  <ListItem sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <LocalOfferIcon sx={{ color: 'primary.main', mr: 2 }} />
                      <Box>
                        <Typography variant="h6">{reward?.name || 'Unknown Reward'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reward?.description || 'Redeem this reward with your loyalty points'}
                        </Typography>
                        <Chip
                          label={`${(reward?.points_required || 0).toLocaleString()} Points`}
                          color={points >= (reward?.points_required || 0) ? 'primary' : 'default'}
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => handleRedeem(reward)}
                      disabled={!reward || points < (reward?.points_required || 0) || redeeming === reward?.id}
                      startIcon={redeeming === reward?.id ? <CircularProgress size={16} /> : <ShoppingCartIcon />}
                      sx={{ minWidth: 100 }}
                    >
                      {redeeming === reward?.id ? 'Redeeming...' : 'Redeem'}
                    </Button>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
            {totalPagesRewards > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination
                  count={totalPagesRewards}
                  page={currentPageRewards}
                  onChange={handlePageChangeRewards}
                  color="primary"
                />
              </Box>
            )}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Your Rewards - Redeemed but unused */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalOfferIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Your Rewards</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {unusedRedemptions.length === 0 ? (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              No rewards yet. Redeem a reward to get started!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {paginatedUnused.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 }
                    }} 
                    elevation={1}
                    onClick={() => {
                      setSelectedRedemption(item);
                      setShowCouponDialog(true);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalOfferIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6">{getRewardDetails(item.reward)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Spent {item.reward?.points_required || 'N/A'} points
                        </Typography>
                      </Box>
                    </Box>
                    <ExpandMoreIcon sx={{ color: 'text.secondary' }} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
          {totalPagesUnused > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPagesUnused}
                page={currentPageUnused}
                onChange={handlePageChangeUnused}
                color="primary"
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Activity */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarsIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Activity</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: '100%' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Points" />
              {/* <Tab label="Referrals" disabled /> */}
            </Tabs>
            
            {tabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Your points balance may not reflect your latest activity
                </Typography> */}
                <List sx={{ p: 0 }}>
                  {activityItems.length === 0 ? (
                    <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                      No activity yet. Start earning points!
                    </Typography>
                  ) : (
                    paginatedActivity.map((activity) => (
                      <React.Fragment key={activity.id}>
                        <ListItem sx={{ justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body1">{activity.description}</Typography>
                            {activity.type === 'redemption' && (
                              <Typography variant="body2" color="text.secondary">
                                {activity.coupon}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(activity.date).toLocaleDateString()}
                            </Typography>
                            <Typography 
                              variant="h6" 
                              color={activity.points > 0 ? 'success.main' : 'error.main'}
                            >
                              {activity.points > 0 ? `+${activity.points} Points` : `${activity.points} Points`}
                            </Typography>
                          </Box>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))
                  )}
                </List>
                {totalPagesActivity > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Pagination
                      count={totalPagesActivity}
                      page={currentPageActivity}
                      onChange={handlePageChangeActivity}
                      color="primary"
                    />
                  </Box>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box sx={{ mt: 2, textAlign: 'center', p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Referrals feature coming soon!
                </Typography>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Transaction History */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalOfferIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Transaction History</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ p: 0 }}>
            {history.length === 0 ? (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                No redemptions yet. Redeem your first reward!
              </Typography>
            ) : (
              paginatedHistory.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={item.reward ? item.reward.name : 'Unknown Reward'}
                      secondary={`Redeemed on ${new Date(item.redeemed_at).toLocaleDateString()} - ${item.reward?.points_required || 'N/A'} points - Coupon: ${item.coupon_code || 'N/A'}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
          {totalPagesHistory > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPagesHistory}
                page={currentPageHistory}
                onChange={handlePageChangeHistory}
                color="primary"
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default LoyaltyPage;
