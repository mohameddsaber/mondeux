import { useState, type Dispatch, type SetStateAction } from 'react';
import { X, Gift, Award, Layers, User, HelpCircle, Lock, Cake, Instagram, Mail, Facebook, Twitter, Trophy, Star, Crown } from 'lucide-react';

interface LoyaltySchemeProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function LoyaltyScheme({ isOpen, setIsOpen }: LoyaltySchemeProps) {

  const [activeTab, setActiveTab] = useState('earn');

  return (
    <>


      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            
            {/* Left Sidebar - Desktop */}
            <div className="hidden md:flex md:flex-col w-80 bg-black text-white">
              <div className="p-8 space-y-2 border-b border-white/20">
                <div className="text-4xl font-bold font-[Karla]">6</div>
                <div className="text-sm opacity-75">points</div>
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4" />
                  <span>Bronze</span>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button 
                  onClick={() => setActiveTab('earn')}
                  className={`w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3 ${
                    activeTab === 'earn' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  <span className="font-[Karla] font-bold text-sm tracking-wider">Earn points</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('rewards')}
                  className={`w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3 ${
                    activeTab === 'rewards' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <Gift className="w-5 h-5" />
                  <span className="font-[Karla] text-sm">Get rewards</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('tiers')}
                  className={`w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3 ${
                    activeTab === 'tiers' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span className="font-[Karla] text-sm">Tiers</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3 ${
                    activeTab === 'account' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-[Karla] text-sm">Account</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('help')}
                  className={`w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3 ${
                    activeTab === 'help' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-[Karla] text-sm">Help</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b flex-shrink-0">
                <div className="flex items-center gap-4">
                  {/* Mobile Menu Badge */}
                  <div className="md:hidden bg-black text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-2">
                    <Layers className="w-3 h-3" />
                    6 pts • Bronze
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold font-[Karla] tracking-wider">
                    {activeTab === 'earn' && 'Earn points'}
                    {activeTab === 'rewards' && 'Get rewards'}
                    {activeTab === 'tiers' && 'Loyalty Tiers'}
                    {activeTab === 'account' && 'My Account'}
                    {activeTab === 'help' && 'Help & Support'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {/* EARN POINTS TAB */}
                {activeTab === 'earn' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-[Karla] font-bold text-lg">Make a purchase</h3>
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold text-2xl text-black">1</span> point per £1 (LE 65.42 EGP)
                      </p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-[Karla] font-bold text-lg">Happy Birthday</h3>
                        <Cake className="w-5 h-5 text-black" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold text-2xl text-black">10</span> points
                      </p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-[Karla] font-bold text-lg">Follow us on Instagram</h3>
                        <Instagram className="w-5 h-5 text-black" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold text-2xl text-black">5</span> points
                      </p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-[Karla] font-bold text-lg">Sign up to our mailing list</h3>
                        <Mail className="w-5 h-5 text-black" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold text-2xl text-black">5</span> points
                      </p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-[Karla] font-bold text-lg">Like us on Facebook</h3>
                        <Facebook className="w-5 h-5 text-black" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold text-2xl text-black">5</span> points
                      </p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-[Karla] font-bold text-lg">Follow us on Twitter</h3>
                        <Twitter className="w-5 h-5 text-black" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold text-2xl text-black">5</span> points
                      </p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-[Karla] font-bold text-lg">Collection Check</h3>
                        <Award className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold text-2xl text-black">1</span> point
                        <span className="ml-2 text-xs">25 days</span>
                      </p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-[Karla] font-bold text-lg">Purchase A Ring Sizer</h3>
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold text-2xl text-black">30</span> points
                      </p>
                    </div>
                  </div>
                )}

                {/* REWARDS TAB */}
                {activeTab === 'rewards' && (
                  <div className="space-y-6">
                    <p className="text-gray-600 font-[Karla]">Redeem your points for exclusive rewards and discounts.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                        <div className="flex items-start justify-between">
                          <h3 className="font-[Karla] font-bold text-lg">5% Off</h3>
                          <Gift className="w-5 h-5 text-black" />
                        </div>
                        <p className="text-sm text-gray-600">Your next purchase</p>
                        <div className="pt-2">
                          <span className="font-bold text-black">50 points</span>
                        </div>
                        <button className="w-full bg-gray-200 text-gray-400 py-2 rounded font-[Karla] text-sm cursor-not-allowed">
                          Not enough points
                        </button>
                      </div>

                      <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                        <div className="flex items-start justify-between">
                          <h3 className="font-[Karla] font-bold text-lg">10% Off</h3>
                          <Gift className="w-5 h-5 text-black" />
                        </div>
                        <p className="text-sm text-gray-600">Your next purchase</p>
                        <div className="pt-2">
                          <span className="font-bold text-black">100 points</span>
                        </div>
                        <button className="w-full bg-gray-200 text-gray-400 py-2 rounded font-[Karla] text-sm cursor-not-allowed">
                          Not enough points
                        </button>
                      </div>

                      <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                        <div className="flex items-start justify-between">
                          <h3 className="font-[Karla] font-bold text-lg">Free Shipping</h3>
                          <Gift className="w-5 h-5 text-black" />
                        </div>
                        <p className="text-sm text-gray-600">On any order</p>
                        <div className="pt-2">
                          <span className="font-bold text-black">75 points</span>
                        </div>
                        <button className="w-full bg-gray-200 text-gray-400 py-2 rounded font-[Karla] text-sm cursor-not-allowed">
                          Not enough points
                        </button>
                      </div>

                      <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4 hover:border-black transition-colors">
                        <div className="flex items-start justify-between">
                          <h3 className="font-[Karla] font-bold text-lg">15% Off</h3>
                          <Gift className="w-5 h-5 text-black" />
                        </div>
                        <p className="text-sm text-gray-600">Your next purchase</p>
                        <div className="pt-2">
                          <span className="font-bold text-black">150 points</span>
                        </div>
                        <button className="w-full bg-gray-200 text-gray-400 py-2 rounded font-[Karla] text-sm cursor-not-allowed">
                          Not enough points
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TIERS TAB */}
                {activeTab === 'tiers' && (
                  <div className="space-y-6">
                    <p className="text-gray-600 font-[Karla]">Unlock better rewards as you move up the tiers.</p>
                    
                    <div className="space-y-4">
                      {/* Bronze Tier - Current */}
                      <div className="border-2 border-black rounded-lg p-6 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-amber-700" />
                            <div>
                              <h3 className="font-[Karla] font-bold text-xl">Bronze</h3>
                              <p className="text-sm text-gray-600">Current Tier</p>
                            </div>
                          </div>
                          <span className="bg-black text-white px-3 py-1 rounded text-sm font-bold">0-99 pts</span>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Earn 1 point per £1 spent
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Birthday bonus: 10 points
                          </li>
                        </ul>
                      </div>

                      {/* Silver Tier */}
                      <div className="border-2 border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-gray-400" />
                            <div>
                              <h3 className="font-[Karla] font-bold text-xl">Silver</h3>
                              <p className="text-sm text-gray-600">Next Tier</p>
                            </div>
                          </div>
                          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-bold">100-499 pts</span>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Earn 1.5 points per £1 spent
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Birthday bonus: 20 points
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Early access to sales
                          </li>
                        </ul>
                      </div>

                      {/* Gold Tier */}
                      <div className="border-2 border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Crown className="w-8 h-8 text-yellow-500" />
                            <div>
                              <h3 className="font-[Karla] font-bold text-xl">Gold</h3>
                              <p className="text-sm text-gray-600">VIP Tier</p>
                            </div>
                          </div>
                          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-bold">500+ pts</span>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Earn 2 points per £1 spent
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Birthday bonus: 50 points
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Free shipping on all orders
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Exclusive VIP events
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* ACCOUNT TAB */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-[Karla] font-bold text-lg">Your Points</h3>
                        <span className="text-3xl font-bold">6</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white p-4 rounded">
                          <div className="text-2xl font-bold text-black">0</div>
                          <div className="text-sm text-gray-600 font-[Karla]">Earned</div>
                        </div>
                        <div className="bg-white p-4 rounded">
                          <div className="text-2xl font-bold text-black">0</div>
                          <div className="text-sm text-gray-600 font-[Karla]">Redeemed</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
                      <h3 className="font-[Karla] font-bold text-lg">Recent Activity</h3>
                      <div className="text-center py-8 text-gray-400">
                        <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No activity yet</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* HELP TAB */}
                {activeTab === 'help' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="border-2 border-gray-200 rounded-lg p-6">
                        <h3 className="font-[Karla] font-bold text-lg mb-2">How do I earn points?</h3>
                        <p className="text-sm text-gray-600">
                          You can earn points by making purchases, following us on social media, signing up for our newsletter, and celebrating your birthday with us!
                        </p>
                      </div>

                      <div className="border-2 border-gray-200 rounded-lg p-6">
                        <h3 className="font-[Karla] font-bold text-lg mb-2">How do I redeem my points?</h3>
                        <p className="text-sm text-gray-600">
                          Visit the "Get rewards" section to see available rewards. Once you have enough points, you can redeem them for discounts and perks.
                        </p>
                      </div>

                      <div className="border-2 border-gray-200 rounded-lg p-6">
                        <h3 className="font-[Karla] font-bold text-lg mb-2">Do my points expire?</h3>
                        <p className="text-sm text-gray-600">
                          Points expire after 12 months of inactivity. Keep earning or redeeming to keep your points active!
                        </p>
                      </div>

                      <div className="border-2 border-gray-200 rounded-lg p-6">
                        <h3 className="font-[Karla] font-bold text-lg mb-2">Need more help?</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Contact our support team for assistance with your loyalty account.
                        </p>
                        <button className="bg-black text-white px-6 py-2 rounded font-[Karla] text-sm hover:bg-gray-800 transition-colors">
                          Contact Support
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Bottom Nav */}
              <div className="md:hidden border-t bg-white p-2 flex justify-around flex-shrink-0">
                <button 
                  onClick={() => setActiveTab('earn')}
                  className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'earn' ? 'text-black' : 'text-gray-400'}`}
                >
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-[Karla]">Earn</span>
                </button>
                <button 
                  onClick={() => setActiveTab('rewards')}
                  className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'rewards' ? 'text-black' : 'text-gray-400'}`}
                >
                  <Gift className="w-5 h-5" />
                  <span className="text-xs font-[Karla]">Rewards</span>
                </button>
                <button 
                  onClick={() => setActiveTab('tiers')}
                  className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'tiers' ? 'text-black' : 'text-gray-400'}`}
                >
                  <Layers className="w-5 h-5" />
                  <span className="text-xs font-[Karla]">Tiers</span>
                </button>
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'account' ? 'text-black' : 'text-gray-400'}`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs font-[Karla]">Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
