include $(TOPDIR)/rules.mk

LUCI_TITLE:=wm dark theme
LUCI_DEPENDS:=+luci-base
LUCI_PKGARCH:=all
PKG_VERSION:=1.13.27
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=wm contributors

include $(TOPDIR)/feeds/luci/luci.mk

# Requires the ucode-based LuCI template engine.
