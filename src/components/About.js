import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './About.css';

function About() {
  const navigate = useNavigate();
  const [topOwners, setTopOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [ownersError, setOwnersError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const chartIds = useMemo(() => {
    const suffix = Math.random().toString(36).slice(2, 9);
    return {
      gradient: `ownerBarGradient-${suffix}`,
      glowFilter: `ownerGlow-${suffix}`,
      title: `ownerChartTitle-${suffix}`
    };
  }, []);
  const ownersForChart = useMemo(() => topOwners.slice(0, 5), [topOwners]);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/stats');
        if (!isMounted) return;
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    const fetchTopOwners = async () => {
      try {
        setOwnersLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/owners/top-rated?limit=5');
        if (!isMounted) return;
        const owners = Array.isArray(data?.owners) ? data.owners : [];
        setTopOwners(
          owners.map((owner) => ({
            ...owner,
            averageRating: Number(owner.averageRating) || 0,
            totalRatings: Number(owner.totalRatings) || 0
          }))
        );
        setOwnersError('');
      } catch (err) {
        if (!isMounted) return;
        setOwnersError('We could not load community ratings right now. Please try again later.');
        setTopOwners([]);
      } finally {
        if (isMounted) {
          setOwnersLoading(false);
        }
      }
    };

    fetchStats();
    fetchTopOwners();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="main-content">
      <div className="about-container fade-in">
        <div className="about-hero">
          <h1>About <span className="brand-highlight">TailMate</span></h1>
          <p className="hero-subtitle">Discover your new best friend! Adopt a loving pet and give them a forever home.</p>
        </div>

        <section className="why-adopt-section">
          <h2>Why Adopt from TailMate?</h2>
          <div className="why-adopt-grid">
            <div className="adopt-reason">
              <div className="adopt-icon">🐾</div>
              <h3>Save a Life</h3>
              <p>Every adoption saves a life and makes room for another pet in need. Be a hero in a pet's story.</p>
            </div>
            <div className="adopt-reason">
              <div className="adopt-icon">🏡</div>
              <h3>Perfect Companion</h3>
              <p>Find the ideal furry friend that matches your lifestyle and brings endless joy to your family.</p>
            </div>
            <div className="adopt-reason">
              <div className="adopt-icon">💖</div>
              <h3>Responsible Adoption</h3>
              <p>Support ethical pet adoption practices and help build a more compassionate community.</p>
            </div>
          </div>
        </section>

        <section className="about-mission">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At TailMate, we believe every pet deserves a loving forever home. Our mission is to
                revolutionize pet adoption by creating meaningful connections between animals in need
                and the perfect families ready to welcome them with open arms.
              </p>
              <p>
                We're more than just an adoption platform – we're a community of pet lovers, dedicated
                volunteers, and caring professionals working together to reduce pet homelessness and
                promote responsible pet ownership.
              </p>
            </div>
            <div className="mission-image">
              <div className="image-placeholder">
                <span>🐕‍🦺🐱</span>
              </div>
            </div>
          </div>
        </section>

        <section className="top-owners-section">
          <div className="top-owners-header">
            <div className="section-badge">🏆 Community Leaders</div>
            <h2>Top Rated Owners</h2>
            <p>Celebrating the community members who go the extra mile for their pets.</p>
          </div>
          {ownersLoading ? (
            <div className="chart-loading">
              <div className="loading-spinner"></div>
              <p>Loading community highlights...</p>
            </div>
          ) : ownersError ? (
            <p className="top-owners-message error">{ownersError}</p>
          ) : ownersForChart.length === 0 ? (
            <div className="no-ratings-card">
              <div className="no-ratings-icon">⭐</div>
              <p>No owner ratings yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="top-owners-card">
              <div className="chart-header">
                <h3>Owner Ratings Overview</h3>
                <span className="chart-legend">
                  <span className="legend-dot"></span> Average Rating (out of 5)
                </span>
              </div>
              {(() => {
                const owners = ownersForChart;
                const MAX_RATING = 5;
                const BAR_WIDTH = 70;
                const BAR_GAP = 50;
                const CHART_LEFT = 72;
                const CHART_RIGHT = 40;
                const CHART_TOP = 50;
                const CHART_BOTTOM = 100;
                const barCount = owners.length;
                const chartInnerWidth = Math.max(0, barCount * BAR_WIDTH + Math.max(barCount - 1, 0) * BAR_GAP);
                const chartInnerHeight = 220;
                const VIEWBOX_WIDTH = CHART_LEFT + chartInnerWidth + CHART_RIGHT;
                const VIEWBOX_HEIGHT = CHART_TOP + chartInnerHeight + CHART_BOTTOM;
                const chartBottom = CHART_TOP + chartInnerHeight;
                const ticks = Array.from({ length: MAX_RATING + 1 }, (_, idx) => idx);

                return (
                  <svg
                    className="owners-chart"
                    viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                    role="img"
                    aria-labelledby={chartIds.title}
                  >
                    <title id={chartIds.title}>Top rated owners bar chart showing average scores out of five stars</title>
                    <defs>
                      <linearGradient id={chartIds.gradient} x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#4ecdc4" />
                        <stop offset="50%" stopColor="#44a08d" />
                        <stop offset="100%" stopColor="#2d9a8c" />
                      </linearGradient>
                      <filter id={chartIds.glowFilter} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Y-axis */}
                    <line
                      className="owners-chart-axis"
                      x1={CHART_LEFT}
                      y1={CHART_TOP - 8}
                      x2={CHART_LEFT}
                      y2={chartBottom}
                    />

                    {/* Grid lines and ticks */}
                    {ticks.map((tick) => {
                      const y = chartBottom - (tick / MAX_RATING) * chartInnerHeight;
                      const isBaseline = tick === 0;
                      return (
                        <g key={`tick-${tick}`}>
                          <line
                            className={isBaseline ? 'owners-chart-axis baseline' : 'owners-chart-grid-line'}
                            x1={CHART_LEFT}
                            y1={y}
                            x2={CHART_LEFT + chartInnerWidth}
                            y2={y}
                            strokeDasharray={isBaseline ? undefined : '4 8'}
                          />
                          <text
                            className="owners-chart-tick"
                            x={CHART_LEFT - 16}
                            y={y + 4}
                            textAnchor="end"
                          >
                            {tick}★
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars */}
                    {owners.map((owner, index) => {
                      const rating = Math.round(Number(owner.averageRating || 0) * 10) / 10;
                      const barHeight = Math.max(8, Math.min(chartInnerHeight, (rating / MAX_RATING) * chartInnerHeight));
                      const barX = CHART_LEFT + index * (BAR_WIDTH + BAR_GAP);
                      const barY = chartBottom - barHeight;
                      const xCenter = barX + BAR_WIDTH / 2;
                      const ratingCount = owner.totalRatings || 0;
                      const ownerName = owner.name || 'Owner';
                      const displayName = ownerName.length > 10 ? ownerName.slice(0, 9) + '...' : ownerName;
                      const ratingLabel = `${rating.toFixed(1)}`;
                      const countLabel = `${ratingCount} ${ratingCount === 1 ? 'review' : 'reviews'}`;
                      
                      return (
                        <g 
                          key={owner.ownerId || index} 
                          className="chart-bar-group"
                          onClick={() => navigate(`/owners/${owner.ownerId}/pets`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Bar shadow */}
                          <rect
                            className="owners-chart-bar-shadow"
                            x={barX + 4}
                            y={barY + 4}
                            width={BAR_WIDTH}
                            height={barHeight}
                            rx={12}
                            ry={12}
                          />
                          {/* Main bar */}
                          <rect
                            className="owners-chart-bar"
                            x={barX}
                            y={barY}
                            width={BAR_WIDTH}
                            height={barHeight}
                            rx={12}
                            ry={12}
                            fill={`url(#${chartIds.gradient})`}
                            filter={`url(#${chartIds.glowFilter})`}
                          />
                          {/* Rating badge */}
                          <g className="rating-badge">
                            <circle
                              cx={xCenter}
                              cy={barY - 18}
                              r={16}
                              fill="#fff"
                              stroke="#4ecdc4"
                              strokeWidth="2"
                            />
                            <text
                              className="owners-chart-value"
                              x={xCenter}
                              y={barY - 14}
                              textAnchor="middle"
                            >
                              {ratingLabel}
                            </text>
                          </g>
                          {/* Rank badge */}
                          <circle
                            cx={xCenter}
                            cy={chartBottom + 24}
                            r={14}
                            fill={index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e0e0e0'}
                            className="rank-badge"
                          />
                          <text
                            className="rank-number"
                            x={xCenter}
                            y={chartBottom + 28}
                            textAnchor="middle"
                          >
                            {index + 1}
                          </text>
                          {/* Owner name */}
                          <text
                            className="owners-chart-xlabel"
                            x={xCenter}
                            y={chartBottom + 52}
                            textAnchor="middle"
                          >
                            {displayName}
                          </text>
                          {/* Reviews count */}
                          <text
                            className="owners-chart-meta"
                            x={xCenter}
                            y={chartBottom + 68}
                            textAnchor="middle"
                          >
                            {countLabel}
                          </text>
                        </g>
                      );
                    })}

                    {/* X-axis baseline */}
                    <line
                      className="owners-chart-axis baseline"
                      x1={CHART_LEFT}
                      y1={chartBottom}
                      x2={CHART_LEFT + chartInnerWidth}
                      y2={chartBottom}
                    />
                  </svg>
                );
              })()}
              <p className="top-owners-footnote">
                <span className="footnote-icon">ℹ️</span>
                Ratings are based on completed adoptions where users rated their experience.
              </p>
              <p className="chart-click-hint">
                <span className="hint-icon">👆</span>
                Click on any owner to view their available pets
              </p>
            </div>
          )}
        </section>

        <section className="about-values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">💝</div>
              <h3>Compassion First</h3>
              <p>Every decision we make is guided by compassion for animals and the people who love them.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Trust & Transparency</h3>
              <p>We believe in honest communication and building trust through transparent adoption processes.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌟</div>
              <h3>Excellence</h3>
              <p>We strive for excellence in everything we do, from pet care to customer service.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Community Impact</h3>
              <p>We're committed to making a positive impact in our community and beyond.</p>
            </div>
          </div>
        </section>

        <section className="about-team">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo">👩‍⚕️</div>
              <h3>Dr. Sarah Johnson</h3>
              <p className="member-role">Chief Veterinarian & Co-Founder</p>
              <p>With 15 years of veterinary experience, Dr. Johnson ensures all our pets receive the best medical care.</p>
            </div>
            <div className="team-member">
              <div className="member-photo">👨‍💼</div>
              <h3>Mike Chen</h3>
              <p className="member-role">CEO & Co-Founder</p>
              <p>A former tech executive turned animal advocate, Mike leads our mission to modernize pet adoption.</p>
            </div>
            <div className="team-member">
              <div className="member-photo">👩‍💻</div>
              <h3>Emily Rodriguez</h3>
              <p className="member-role">Head of Operations</p>
              <p>Emily coordinates with shelters nationwide to ensure smooth adoption processes and happy outcomes.</p>
            </div>
            <div className="team-member">
              <div className="member-photo">👨‍🎨</div>
              <h3>Alex Thompson</h3>
              <p className="member-role">Community Manager</p>
              <p>Alex builds relationships with adopters and provides ongoing support for new pet parents.</p>
            </div>
          </div>
        </section>

        <section className="about-impact">
          <h2>Our Impact</h2>
          <p className="impact-subtitle">Real-time statistics from our community</p>
          <div className="impact-stats">
            <div className="stat-item">
              <div className="stat-icon">🐾</div>
              <div className="stat-number">
                {statsLoading ? '...' : (stats?.adoptedPets || 0)}
              </div>
              <div className="stat-label">Pets Adopted</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🛒</div>
              <div className="stat-number">
                {statsLoading ? '...' : (stats?.soldPets || 0)}
              </div>
              <div className="stat-label">Pets Sold</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏠</div>
              <div className="stat-number">
                {statsLoading ? '...' : (stats?.availablePets || 0)}
              </div>
              <div className="stat-label">Available Pets</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <div className="stat-number">
                {statsLoading ? '...' : (stats?.totalUsers || 0)}
              </div>
              <div className="stat-label">Happy Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏪</div>
              <div className="stat-number">
                {statsLoading ? '...' : (stats?.totalOwners || 0)}
              </div>
              <div className="stat-label">Pet Owners</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📊</div>
              <div className="stat-number">
                {statsLoading ? '...' : `${stats?.successRate || 0}%`}
              </div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </section>

        <section className="about-cta">
          <div className="cta-content">
            <h2>Ready to Find Your Perfect Pet?</h2>
            <p>Join thousands of happy families who found their furry friends through TailMate.</p>
            <div className="cta-buttons">
              <Link to="/pets" className="btn btn-primary">Browse Pets</Link>
              <Link to="/signup" className="btn btn-secondary">Join Our Community</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
